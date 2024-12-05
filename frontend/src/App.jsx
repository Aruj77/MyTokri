import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .post("http://localhost:5000/api/data")
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <h1>API Data Display</h1>
      {loading ? <p>Loading data...</p> : null}
      {error ? <p>{error}</p> : null}
      <div id="data">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="data-item">
              {JSON.stringify(item)}
            </div>
          ))
        ) : (
          <p>No data found</p>
        )}
      </div>
    </div>
  );
};

export default App;
