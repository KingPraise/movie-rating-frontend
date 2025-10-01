import { useEffect, useState } from "react";
import api from "../api/axios"; // make sure this path matches your project

export default function TestApi() {
    const [data, setData] = useState<string>("Loading...");

    useEffect(() => {
        api.get("/movies?page=1&limit=1/")
            .then(res => setData(JSON.stringify(res.data, null, 2)))
            .catch(err => setData("Error: " + (err.response?.data?.detail || err.message)));
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">API Connection Test</h2>
            <pre className="bg-gray-100 p-4 rounded">{data}</pre>
        </div>
    );
}
