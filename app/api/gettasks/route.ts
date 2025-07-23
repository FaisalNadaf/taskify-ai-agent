/** @format */

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
	try {
		const { prompt } = await req.json();

		// Use the latest model (gemini-1.5-flash or gemini-1.5-pro)
		const model = genAI.getGenerativeModel({
			model: "gemini-1.5-flash",
		});

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();
		console.log(text);
		return NextResponse.json({ text });
	} catch (error) {
		console.error("Gemini API Error:", error);
		return NextResponse.json(
			{ error: "Failed to generate content" },
			{ status: 500 },
		);
	}
}
