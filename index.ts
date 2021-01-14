// const express=require('express');

import express from "express";
const bodyparser = require("body-parser");
// const nodemailer = require("nodemailer");
import nodemailer from "nodemailer";
const path = require("path");
const exphbs = require("express-handlebars");

import { emailPassword } from "./env";

const app = express();

// view engine setup
app.engine(
	"handlebars",
	exphbs({ extname: "hbs", defaultLayout: false, layoutsDir: "views/ " })
);
app.set("view engine", "handlebars");

// body parser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//static folder
app.use("/public", express.static(path.join(__dirname, "public")));

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	service: "Gmail",
	auth: {
		user: "cya.herald.grass@gmail.com",
		pass: emailPassword,
	},
});

const emailAndOtp: any = {}; // Temporary save email and their otp here

app.get("/", function (req, res) {
	res.render("contact");
	// res.send("Hello");
});

app.post("/send", function (req, res) {
	let otp = parseInt((Math.random() * 1000000).toString());
	let email = req.body.email;

	// send mail with defined transport object
	var mailOptions = {
		to: req.body.email,
		subject: "Otp for registration is: ",
		html:
			"<h3>OTP for account verification is </h3>" +
			"<h1 style='font-weight:bold;'>" +
			otp +
			"</h1>", // html body
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log("Message sent: %s", info.messageId);
		console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

		// OTP page will take email as a query statement for it POST methods
		emailAndOtp[email] = otp;
		res.render("otp", { Data: { email: email } });
	});
});

app.post("/resend", function (req, res) {
	let email = req.query.email?.toString() as string;
	let otp = emailAndOtp[email];

	var mailOptions = {
		to: email,
		subject: "Otp for registration is: ",
		html:
			"<h3>OTP for account verification is </h3>" +
			"<h1 style='font-weight:bold;'>" +
			otp +
			"</h1>", // html body
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log("Message sent: %s", info.messageId);
		console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
		res.render("otp", { Data: { msg: "otp has been sent" } });
	});
});

app.post("/verify", function (req, res) {
	let email = req.query.email?.toString() as string;
	let otp = emailAndOtp[email];

	if (req.body.otp == otp) {
		res.send("You has been successfully registered");
	} else {
		res.render("otp", { msg: "otp is incorrect" });
	}
});

//defining port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`app is live at ${PORT}`);
});
