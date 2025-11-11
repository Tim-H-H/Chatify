export default function Message({ msg, isOwn, onDelete }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[70%] p-3 rounded ${
          isOwn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <div className="text-sm">{msg.text}</div>
        <div className="text-xs mt-2 text-black-200">
          {new Date(msg.createdAt || Date.now()).toLocaleString()}
        </div>
        {isOwn && (
          <button
            onClick={() => onDelete(msg.id || msg._id)}
            className="text-xs text-red-100 mt-2"
          >
            Radera
          </button>
        )}
      </div>
    </div>
  );
}