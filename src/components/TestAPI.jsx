import { useEffect, useState } from 'react';
function TestAPI() {
  const [message, setMessage] = useState("...Loading...");
  async function fetchData() {
    const result = await fetch('http://localhost:3000/api/hello');
    const data = await result.json();
    console.log("result: ", result);
    console.log("data:", data);
    setMessage(data.message);
  }
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      Message: {message}
    </div>
  )
}
export default TestAPI