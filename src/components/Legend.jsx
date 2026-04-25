export default function Legend() {
  return (
    <div className="fixed bottom-6 left-6 flex flex-col gap-1.5 pointer-events-none" style={{ fontFamily: "'League Spartan', sans-serif" }}>
      <span className="inline-block bg-green-400 text-[#101010] rounded-md px-2.5 py-0.5 text-md font-medium w-fit">
        Core requirement
      </span>
      <span className="inline-block bg-[#ffd700] text-[#101010] rounded-md px-2.5 py-0.5 text-md font-medium w-fit">
        Honours requirement
      </span>
    </div>
  )
}