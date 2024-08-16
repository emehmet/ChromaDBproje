import React, { useState } from "react";
import axios from "axios";
import "./QueryComponent.css";

interface QueryResponse {
  documents?: { pageContent: string; metadata: any; score: number }[];
}

const QueryComponent: React.FC = () => {
  const [queryText, setQueryText] = useState<string>("");
  const [results, setResults] = useState<{ pageContent: string; metadata: any; score: number }[]>([]);
  const [error, setError] = useState<string>("");

  const handleQuery = async () => {
    try {
      const response = await axios.post<QueryResponse>(
        "http://localhost:5000/query",
        {
          query: queryText,
          nResults: 20,
        }
      );

      console.log("Response data:", response.data);

      // Flatten and map results if they are objects with pageContent, metadata, and score
      const nestedResults = response.data.documents || [];
      const flattenedResults = nestedResults.flat(); // Flatten if nested

      
      console.log("Flattened Results:", flattenedResults);

      const pairedResults: { pageContent: string; metadata: any; score: any }[] = [];
    
    for (let i = 0; i < flattenedResults.length; i += 2) {
      const content = flattenedResults[i];
      const score = flattenedResults[i + 1];
      pairedResults.push({ 
        pageContent: content.pageContent,
        metadata: content.metadata,
        score: score
      });
    };

      setResults(pairedResults);

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
      {error && <p className="error-text">{error}</p>}
      <div className="results">
        <h2>Results</h2>
        <ul className="results-list">
          {results.map((result, index) => (
            <li key={index} className="result-item">
              <div><strong>Content:</strong> {result.pageContent}</div>
              <div><strong>Metadata:</strong> {JSON.stringify(result.metadata)}</div> {/* Display metadata */}
              <div><strong>Score:</strong> {result.score}</div> {/* Display similarity score */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default QueryComponent;
