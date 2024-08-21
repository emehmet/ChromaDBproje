import React, { useState } from "react";
import axios from "axios";
import "./QueryComponent.css";

const QueryComponent = () => {
  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleQuery = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/collection/bulk-test/query",
        {
          queryTexts: queryText,
          nResults: 5,
        }
      );

      console.log("Response data:", response.data);

      // Ensure the response data structure matches your expectations
      setResults(response.data.documents[0] || []); // Assuming pairedResults should be an array
    } catch (err) {
      console.error("Error querying:", err);
      setError("Error querying the database");
    }
  };

  return (
    <div className="query-container">
      <h1>Query ChromaDB</h1>
      <input
        className="query-text-box"
        type="text"
        value={queryText}
        onChange={(e) => setQueryText(e.target.value)}
        placeholder="Enter your query"
      />
      <button className="query-button" onClick={handleQuery}>
        Query
      </button>
      {error && <p>{error}</p>}
      <div className="results">
        <h2>Results</h2>
        <ul className="results-list">
          {results?.map((result, index) => (
            <li key={index} className="result-item">
              <p key={index + "a"} className="result-paragraph">
                {result}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QueryComponent;
