import SignatureDemo from './components/SignatureDemo'

function App() {
  return (
    <div className="max-w-[960px] mx-auto p-6">
      <div className="shrink-0 pb-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Signature Kit</h1>
          <span className="inline-block text-[0.7rem] font-semibold px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] tracking-wide">React Playground</span>
        </div>
      </div>
      <SignatureDemo />
    </div>
  )
}

export default App
