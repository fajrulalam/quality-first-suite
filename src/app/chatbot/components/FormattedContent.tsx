import React from "react";

export const FormattedContent = ({ content }: { content: string }) => {
  return <div>{content}</div>;
};

// Component to format markdown-like content
// export const FormattedContent = ({ content }: { content: string }) => {
//   const formatText = (text: string) => {
//     const linkRegex = /((?:https?|ftp):\/\/[^\s/$.?#].[^\s]*)/gi;
//     const boldRegex = /\*\*([^*]+)\*\*/g;
//     const listRegex = /^\s*[-*]\s+(.*)/gm;
//
//     let parts = text.split(linkRegex);
//
//     return parts.map((part, index) => {
//       if (part.match(linkRegex)) {
//         return (
//           <a
//             key={index}
//             href={part}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-500 hover:underline"
//           >
//             {part}
//           </a>
//         );
//       }
//
//       let boldParts = part.split(boldRegex);
//       let listParts = part.split(listRegex);
//
//       if (listParts.length > 1) {
//         return (
//           <ul key={index} className="list-disc list-inside pl-4 my-2">
//             {listParts.map((item, i) => {
//               if (item.trim()) {
//                 return <li key={i}>{item.trim()}</li>;
//               }
//               return null;
//             })}
//           </ul>
//         );
//       }
//
//       if (boldParts.length > 1) {
//         return boldParts.map((boldPart, i) => {
//           if (i % 2 === 1) {
//             return <strong key={i}>{boldPart}</strong>;
//           }
//           return <span key={i}>{boldPart}</span>;
//         });
//       }
//
//       return <span key={index}>{part}</span>;
//     });
//   };
//
//   const paragraphs = content.split("\n\n");
//
//   return (
//     <div className="space-y-4">
//       {paragraphs.map((paragraph, index) => (
//         <p key={index} className="whitespace-pre-wrap">
//           {formatText(paragraph)}
//         </p>
//       ))}
//     </div>
//   );
// };
