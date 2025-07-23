/** @format */

"use client";
import { useState } from "react";
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	sortableKeyboardCoordinates,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
	arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { saveAs } from "file-saver";

interface PriorityTasks {
	highPriority: string[];
	mediumPriority: string[];
	lowPriority: string[];
}

function SortableTask({ id }: { id: string }) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<li
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="bg-gray-100 p-2 rounded shadow-sm cursor-move">
			{id}
		</li>
	);
}

export default function GeminiChat() {
	const [prompt, setPrompt] = useState("");
	const [response, setResponse] = useState<PriorityTasks>({
		highPriority: [],
		mediumPriority: [],
		lowPriority: [],
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const sensors = useSensors(useSensor(PointerSensor));

	const handleDragEnd = (event: any) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const updated = { ...response };
		for (const key of Object.keys(updated)) {
			const list = updated[key as keyof PriorityTasks];
			const oldIndex = list.indexOf(active.id);
			const newIndex = list.indexOf(over.id);
			if (oldIndex !== -1 && newIndex !== -1) {
				updated[key as keyof PriorityTasks] = arrayMove(
					list,
					oldIndex,
					newIndex,
				);
				break;
			}
		}
		setResponse(updated);
	};

	const exportToJSON = () => {
		const blob = new Blob([JSON.stringify(response, null, 2)], {
			type: "application/json;charset=utf-8",
		});
		saveAs(blob, "tasks.json");
	};

	const exportToCSV = () => {
		const rows = [
			["Priority", "Task"],
			...response.highPriority.map((t) => ["High", t]),
			...response.mediumPriority.map((t) => ["Medium", t]),
			...response.lowPriority.map((t) => ["Low", t]),
		];

		const csv = rows
			.map((row) => row.map((val) => `"${val}"`).join(","))
			.join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		saveAs(blob, "tasks.csv");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const res = await fetch("/api/gettasks", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt: `You are an excellent task manager. Categorize these tasks into high/medium/low priority and return ONLY a JSON array in this exact format:
[
  {"highPriority": []},
  {"mediumPriority": []},
  {"lowPriority": []}
]

Tasks to categorize:
${prompt}`,
				}),
			});

			const data = await res.json();
			console.log("Raw API response:", data);

			let parsedResponse: PriorityTasks = {
				highPriority: [],
				mediumPriority: [],
				lowPriority: [],
			};

			let jsonText = "";
			if (typeof data === "object" && typeof data.text === "string") {
				const match = data.text.match(/```json([\s\S]*?)```/i);
				jsonText = match ? match[1].trim() : data.text.trim();
				console.log("Extracted JSON:", jsonText);

				try {
					const parsed = JSON.parse(jsonText);

					if (Array.isArray(parsed)) {
						parsed.forEach((item) => {
							if (item.highPriority)
								parsedResponse.highPriority = item.highPriority;
							if (item.mediumPriority)
								parsedResponse.mediumPriority = item.mediumPriority;
							if (item.lowPriority)
								parsedResponse.lowPriority = item.lowPriority;
						});
					} else if (typeof parsed === "object" && parsed !== null) {
						if (parsed.highPriority)
							parsedResponse.highPriority = parsed.highPriority;
						if (parsed.mediumPriority)
							parsedResponse.mediumPriority = parsed.mediumPriority;
						if (parsed.lowPriority)
							parsedResponse.lowPriority = parsed.lowPriority;
					}
				} catch (err) {
					console.error("Failed to parse Gemini JSON:", err, jsonText);
					setError("Failed to parse Gemini response. Please try again.");
				}
			}

			setResponse(parsedResponse);
			console.log("Parsed response:", parsedResponse);
		} catch (err) {
			console.error("API Error:", err);
			setError("Failed to prioritize tasks. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-screen h-screen mx-auto p-10">
			<form
				onSubmit={handleSubmit}
				className="mb-4">
				<div className="flex gap-4">
					<textarea
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder="Enter your tasks, one per line..."
						className="w-full flex-1 h-[200px] p-2 border rounded"
						rows={3}
						required
					/>{" "}
					<div className="w-1/6 gap-4 mt-6 flex flex-col">
						<button
							onClick={exportToJSON}
							className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
							Export as JSON
						</button>
						<button
							onClick={exportToCSV}
							className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
							Export as CSV
						</button>
					</div>
				</div>
				<button
					type="submit"
					disabled={isLoading}
					className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
					{isLoading ? "Prioritizing..." : "Prioritize Tasks"}
				</button>
			</form>

			{error && (
				<div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
					<p>{error}</p>
				</div>
			)}

			<div className="flex gap-4 min-h-[60%]">
				{["highPriority", "mediumPriority", "lowPriority"].map(
					(priorityKey) => {
						const titleMap = {
							highPriority: "High Priority",
							mediumPriority: "Medium Priority",
							lowPriority: "Low Priority",
						};
						const colorMap = {
							highPriority: "red",
							mediumPriority: "yellow",
							lowPriority: "green",
						};

						const tasks = response[priorityKey as keyof PriorityTasks];

						return (
							<div
								key={priorityKey}
								className={`p-4 flex-1 min-h-full bg-white border border-${
									colorMap[priorityKey as keyof typeof colorMap]
								}-200 rounded shadow flex flex-col min-h-0 overflow-y-auto text-black`}>
								<h3
									className={`font-bold text-lg text-${
										colorMap[priorityKey as keyof typeof colorMap]
									}-700 mb-2`}>
									{titleMap[priorityKey as keyof typeof titleMap]}
								</h3>
								{tasks.length > 0 ? (
									<DndContext
										sensors={sensors}
										collisionDetection={closestCenter}
										onDragEnd={handleDragEnd}>
										<SortableContext
											items={tasks}
											strategy={verticalListSortingStrategy}>
											<ul
												className="space-y-2 overflow-y-auto"
												style={{ maxHeight: "350px" }}>
												{tasks.map((task) => (
													<SortableTask
														key={task}
														id={task}
													/>
												))}
											</ul>
										</SortableContext>
									</DndContext>
								) : (
									<p className="text-gray-500">No tasks</p>
								)}
							</div>
						);
					},
				)}
			</div>
		</div>
	);
}
