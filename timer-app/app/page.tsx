export default function Home() {

  // set needed variables
  const timer = '00:00:00'
  const session_count = 'Session 0'

  return (
    <div className="container">
      <h1>Study Timer</h1>
      <div className="top-level">
        <hr /> {/* TODO: Figure out how to make a divider to make a smooth UI */}
        <h1>{timer}</h1>
        <h2>{session_count}</h2>

        <div className="controls">
          <button>Start</button>
          <button>Pause</button>
          <button>Reset</button>
        </div>
      </div>
    </div>
  );
}
