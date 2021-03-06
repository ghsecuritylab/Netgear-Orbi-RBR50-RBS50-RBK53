/* Copyright (c) 2014, The Linux Foundation. All rights reserved.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2 and
 * only version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

#include <linux/module.h>
#include <linux/interrupt.h>
#include <linux/of.h>
#include <linux/of_gpio.h>
#include <linux/gpio.h>
#include <linux/delay.h>
#include <linux/slab.h>
#include <linux/leds.h>
#include <linux/regulator/consumer.h>
#include <linux/dma-mapping.h>
#include <linux/uaccess.h>

#include <linux/msm-sps.h>

#include "mdss.h"
#include "mdss_panel.h"
#include "mdss_qpic.h"
#include "mdss_qpic_panel.h"

static u32 panel_is_on;
static u32 panel_refresh_rate;

int (*qpic_panel_on)(struct qpic_panel_io_desc *qpic_panel_io);
EXPORT_SYMBOL(qpic_panel_on);
void (*qpic_panel_off)(struct qpic_panel_io_desc *qpic_panel_io);
EXPORT_SYMBOL(qpic_panel_off);

static int mdss_qpic_pinctrl_init(struct platform_device *pdev,
		struct qpic_panel_io_desc *qpic_panel_io);

u32 qpic_panel_get_framerate(void)
{
	return panel_refresh_rate;
}

/* write a frame of pixels to a MIPI screen */
u32 qpic_send_frame(u32 x_start,
				u32 y_start,
				u32 x_end,
				u32 y_end,
				u32 *data,
				u32 total_bytes)
{
	u8 param[4];
	u32 status;
	u32 start_0_7;
	u32 end_0_7;
	u32 start_8_15;
	u32 end_8_15;

	/* convert to 16 bit representation */
	x_start = x_start & 0xffff;
	y_start = y_start & 0xffff;
	x_end = x_end & 0xffff;
	y_end = y_end & 0xffff;

	/* set column/page */
	start_0_7 = x_start & 0xff;
	end_0_7 = x_end & 0xff;
	start_8_15 = (x_start >> 8) & 0xff;
	end_8_15 = (x_end >> 8) & 0xff;
	param[0] = start_8_15;
	param[1] = start_0_7;
	param[2] = end_8_15;
	param[3] = end_0_7;
	status = qpic_send_pkt(OP_SET_COLUMN_ADDRESS, param, 4);
	if (status) {
		pr_err("Failed to set column address");
		return status;
	}

	start_0_7 = y_start & 0xff;
	end_0_7 = y_end & 0xff;
	start_8_15 = (y_start >> 8) & 0xff;
	end_8_15 = (y_end >> 8) & 0xff;
	param[0] = start_8_15;
	param[1] = start_0_7;
	param[2] = end_8_15;
	param[3] = end_0_7;
	status = qpic_send_pkt(OP_SET_PAGE_ADDRESS, param, 4);
	if (status) {
		pr_err("Failed to set page address");
		return status;
	}

	status = qpic_send_pkt(OP_WRITE_MEMORY_START, (u8 *)data, total_bytes);
	if (status) {
		pr_err("Failed to start memory write");
		return status;
	}
	return 0;
}

static int mdss_qpic_pinctrl_init(struct platform_device *pdev,
		struct qpic_panel_io_desc *qpic_panel_io)
{
	qpic_panel_io->pin_res.pinctrl = devm_pinctrl_get(&pdev->dev);
	if (IS_ERR_OR_NULL(qpic_panel_io->pin_res.pinctrl)) {
		pr_err("%s: failed to get pinctrl\n", __func__);
		return PTR_ERR(qpic_panel_io->pin_res.pinctrl);
	}

	qpic_panel_io->pin_res.gpio_state_active
		= pinctrl_lookup_state(qpic_panel_io->pin_res.pinctrl,
				MDSS_PINCTRL_STATE_DEFAULT);
	if (IS_ERR_OR_NULL(qpic_panel_io->pin_res.gpio_state_active))
		pr_warn("%s: cannot get default pinstate\n", __func__);

	qpic_panel_io->pin_res.gpio_state_suspend
		= pinctrl_lookup_state(qpic_panel_io->pin_res.pinctrl,
				MDSS_PINCTRL_STATE_SLEEP);
	if (IS_ERR_OR_NULL(qpic_panel_io->pin_res.gpio_state_suspend))
		pr_warn("%s: cannot get sleep pinstate\n", __func__);

	return 0;
}

static int mdss_qpic_pinctrl_set_state(struct qpic_panel_io_desc *qpic_panel_io,
		bool active)
{
	struct pinctrl_state *pin_state;
	int rc = -EFAULT;

	if (IS_ERR_OR_NULL(qpic_panel_io->pin_res.pinctrl))
		return PTR_ERR(qpic_panel_io->pin_res.pinctrl);

	pin_state = active ? qpic_panel_io->pin_res.gpio_state_active
		: qpic_panel_io->pin_res.gpio_state_suspend;
	if (!IS_ERR_OR_NULL(pin_state)) {
		rc = pinctrl_select_state(qpic_panel_io->pin_res.pinctrl,
				pin_state);
		if (rc)
			pr_err("%s: can not set %s pins\n", __func__,
					active ? MDSS_PINCTRL_STATE_DEFAULT
					: MDSS_PINCTRL_STATE_SLEEP);
	} else {
		pr_err("%s: invalid '%s' pinstate\n", __func__,
					active ? MDSS_PINCTRL_STATE_DEFAULT
					: MDSS_PINCTRL_STATE_SLEEP);
	}

	return rc;
}

static int mdss_panel_io_init(struct qpic_panel_io_desc *panel_io)
{
	int rc;
	if (panel_io->vdd_vreg) {
		rc = regulator_set_voltage(panel_io->vdd_vreg,
			1800000, 1800000);
		if (rc) {
			pr_err("vdd_vreg->set_voltage failed, rc=%d\n", rc);
			return -EINVAL;
		}
	}
	if (panel_io->avdd_vreg) {
		rc = regulator_set_voltage(panel_io->avdd_vreg,
			2700000, 2700000);
		if (rc) {
			pr_err("vdd_vreg->set_voltage failed, rc=%d\n", rc);
			return -EINVAL;
		}
	}
	return 0;
}

static void mdss_panel_io_off(struct qpic_panel_io_desc *qpic_panel_io)
{
	if (mdss_qpic_pinctrl_set_state(qpic_panel_io, false))
		pr_warn("%s panel on: pinctrl not enabled\n", __func__);

	if (qpic_panel_io->ad8_gpio)
		gpio_free(qpic_panel_io->ad8_gpio);
	if (qpic_panel_io->cs_gpio)
		gpio_free(qpic_panel_io->cs_gpio);
	if (qpic_panel_io->rst_gpio)
		gpio_free(qpic_panel_io->rst_gpio);
	if (qpic_panel_io->te_gpio)
		gpio_free(qpic_panel_io->te_gpio);
	if (qpic_panel_io->bl_gpio)
		gpio_free(qpic_panel_io->bl_gpio);
	if (qpic_panel_io->vdd_vreg)
		regulator_disable(qpic_panel_io->vdd_vreg);
	if (qpic_panel_io->avdd_vreg)
		regulator_disable(qpic_panel_io->avdd_vreg);
}


static int mdss_panel_io_on(struct qpic_panel_io_desc *qpic_panel_io)
{
	int rc;
	if (qpic_panel_io->vdd_vreg) {
		rc = regulator_enable(qpic_panel_io->vdd_vreg);
		if (rc) {
			pr_err("enable vdd failed, rc=%d\n", rc);
			return -ENODEV;
		}
	}

	if (qpic_panel_io->avdd_vreg) {
		rc = regulator_enable(qpic_panel_io->avdd_vreg);
		if (rc) {
			pr_err("enable avdd failed, rc=%d\n", rc);
			goto power_on_error;
		}
	}

	/* GPIO settings using pinctrl */
	if (mdss_qpic_pinctrl_set_state(qpic_panel_io, true)) {
		pr_warn("%s panel on: pinctrl not enabled\n", __func__);

		if ((qpic_panel_io->rst_gpio) &&
			(gpio_request(qpic_panel_io->rst_gpio, "disp_rst_n"))) {
			pr_err("%s request reset gpio failed\n", __func__);
			goto power_on_error;
		}

		if ((qpic_panel_io->cs_gpio) &&
			(gpio_request(qpic_panel_io->cs_gpio, "disp_cs_n"))) {
			pr_err("%s request cs gpio failed\n", __func__);
			goto power_on_error;
		}

		if ((qpic_panel_io->ad8_gpio) &&
			(gpio_request(qpic_panel_io->ad8_gpio, "disp_ad8_n"))) {
			pr_err("%s request ad8 gpio failed\n", __func__);
			goto power_on_error;
		}

		if ((qpic_panel_io->te_gpio) &&
			(gpio_request(qpic_panel_io->te_gpio, "disp_te_n"))) {
			pr_err("%s request te gpio failed\n", __func__);
			goto power_on_error;
		}

		if ((qpic_panel_io->bl_gpio) &&
			(gpio_request(qpic_panel_io->bl_gpio, "disp_bl_n"))) {
			pr_err("%s request bl gpio failed\n", __func__);
			goto power_on_error;
		}
	}

	/* wait for 20 ms after enable gpio as suggested by hw */
	msleep(20);
	return 0;
power_on_error:
	mdss_panel_io_off(qpic_panel_io);
	return -EINVAL;
}

int mdss_qpic_panel_on(struct mdss_panel_data *pdata,
	struct qpic_panel_io_desc *panel_io)
{
	int rc = 0;

	if (panel_is_on)
		return 0;
	mdss_qpic_init();

	if (!panel_io->init) {
		mdss_panel_io_init(panel_io);
		panel_io->init = true;
	}
	mdss_panel_io_on(panel_io);
	if (qpic_panel_on)
		rc = qpic_panel_on(panel_io);
	if (rc)
		return rc;
	panel_is_on = true;
	mdss_qpic_set_cfg0();
	return 0;
}

int mdss_qpic_panel_off(struct mdss_panel_data *pdata,
	struct qpic_panel_io_desc *panel_io)
{
	if (qpic_panel_off)
		qpic_panel_off(panel_io);
	mdss_panel_io_off(panel_io);
	panel_is_on = false;
	return 0;
}

int mdss_qpic_panel_io_init(struct platform_device *pdev,
	struct qpic_panel_io_desc *qpic_panel_io)
{
	int rc = 0;
	struct device_node *np = pdev->dev.of_node;
	int rst_gpio, cs_gpio, te_gpio, ad8_gpio, bl_gpio;
	struct regulator *vdd_vreg;
	struct regulator *avdd_vreg;

	rc = mdss_qpic_pinctrl_init(pdev, qpic_panel_io);
	if (rc)
		pr_warn("%s: failed to get pin resources\n", __func__);

	rst_gpio = of_get_named_gpio(np, "qcom,rst-gpio", 0);
	cs_gpio = of_get_named_gpio(np, "qcom,cs-gpio", 0);
	ad8_gpio = of_get_named_gpio(np, "qcom,ad8-gpio", 0);
	te_gpio = of_get_named_gpio(np, "qcom,te-gpio", 0);
	bl_gpio = of_get_named_gpio(np, "qcom,bl-gpio", 0);

	if (!gpio_is_valid(rst_gpio))
		pr_warn("%s: reset gpio not specified\n" , __func__);
	else
		qpic_panel_io->rst_gpio = rst_gpio;

	if (!gpio_is_valid(cs_gpio))
		pr_warn("%s: cs gpio not specified\n", __func__);
	else
		qpic_panel_io->cs_gpio = cs_gpio;

	if (!gpio_is_valid(ad8_gpio))
		pr_warn("%s: ad8 gpio not specified\n", __func__);
	else
		qpic_panel_io->ad8_gpio = ad8_gpio;

	if (!gpio_is_valid(te_gpio))
		pr_warn("%s: te gpio not specified\n", __func__);
	else
		qpic_panel_io->te_gpio = te_gpio;

	if (!gpio_is_valid(bl_gpio))
		pr_warn("%s: bl gpio not specified\n", __func__);
	else
		qpic_panel_io->bl_gpio = bl_gpio;

	vdd_vreg = devm_regulator_get(&pdev->dev, "vdd");
	if (IS_ERR(vdd_vreg)) {
		qpic_panel_io->vdd_vreg = NULL;
		pr_err("%s could not get vdd,", __func__);
	} else
		qpic_panel_io->vdd_vreg = vdd_vreg;

	avdd_vreg = devm_regulator_get(&pdev->dev, "avdd");
	if (IS_ERR(avdd_vreg)) {
		qpic_panel_io->avdd_vreg = NULL;
		pr_err("%s could not get avdd,", __func__);
	} else
		qpic_panel_io->avdd_vreg = avdd_vreg;

	return 0;
}

static int mdss_panel_parse_dt(struct platform_device *pdev,
			       struct mdss_panel_data *panel_data)
{
	struct device_node *np = pdev->dev.of_node;
	u32 res[6], tmp;
	int rc;

	rc = of_property_read_u32_array(np, "qcom,mdss-pan-res", res, 2);
	if (rc) {
		pr_err("%s:%d, panel resolution not specified\n",
						__func__, __LINE__);
		return -EINVAL;
	}
	panel_data->panel_info.xres = (!rc ? res[0] : 240);
	panel_data->panel_info.yres = (!rc ? res[1] : 320);
	rc = of_property_read_u32(np, "qcom,mdss-pan-bpp", &tmp);
	if (rc) {
		pr_err("%s:%d, panel bpp not specified\n",
						__func__, __LINE__);
		return -EINVAL;
	}
	panel_data->panel_info.bpp = (!rc ? tmp : 24);
	of_property_read_u32(np, "qcom,refresh_rate", &panel_refresh_rate);

	panel_data->panel_info.type = EBI2_PANEL;
	panel_data->panel_info.pdest = DISPLAY_1;

	return rc;
}

static int mdss_qpic_panel_probe(struct platform_device *pdev)
{
	int rc = 0;
	static struct mdss_panel_data vendor_pdata;
	static const char *panel_name;

	pr_debug("%s:%d, debug info id=%d", __func__, __LINE__, pdev->id);
	if (!pdev->dev.of_node)
		return -ENODEV;

	panel_name = of_get_property(pdev->dev.of_node, "label", NULL);
	if (!panel_name)
		pr_info("%s:%d, panel name not specified\n",
						__func__, __LINE__);
	else
		pr_info("%s: Panel Name = %s\n", __func__, panel_name);

	rc = mdss_panel_parse_dt(pdev, &vendor_pdata);
	if (rc)
		return rc;

	rc = qpic_register_panel(&vendor_pdata);
	if (rc)
		return rc;

	return 0;
}

static const struct of_device_id mdss_qpic_panel_match[] = {
	{.compatible = "qcom,mdss-qpic-panel"},
	{}
};

static struct platform_driver this_driver = {
	.probe  = mdss_qpic_panel_probe,
	.driver = {
		.name = "qpic_panel",
		.of_match_table = mdss_qpic_panel_match,
	},
};

static int __init mdss_qpic_panel_init(void)
{
	return platform_driver_register(&this_driver);
}
MODULE_DEVICE_TABLE(of, mdss_qpic_panel_match);
module_init(mdss_qpic_panel_init);
