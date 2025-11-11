// import React, { useState } from "react";

// interface Message {
//   role: "user" | "assistant";
//   content: string;
// }

// const PeaceBot: React.FC = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState<Message[]>([]);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const newMessages = [...messages, { role: "user", content: input }];
//     setMessages(newMessages);
//     setInput("");

//     const res = await fetch("http://localhost:8000/peacebot/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ user_input: input, context: messages }),
//     });

//     const data = await res.json();
//     setMessages([...newMessages, { role: "assistant", content: data.reply }]);
//   };

//   return (
//     <div className="p-4 max-w-xl mx-auto">
//       <div className="space-y-2">
//         {messages.map((msg, idx) => (
//           <div key={idx} className={`text-${msg.role === "user" ? "blue" : "green"}-600`}>
//             {msg.role === "user" ? "You" : "PeaceBot"}: {msg.content}
//           </div>
//         ))}
//       </div>
//       <input
//         className="border p-2 w-full mt-4"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         placeholder="Share your thoughts..."
//       />
//       <button
//         className="bg-blue-500 text-white px-4 py-2 mt-2"
//         onClick={sendMessage}
//       >
//         Send
//       </button>
//     </div>
//   );
// };

// export default PeaceBot;
