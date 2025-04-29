import { useEffect, useState } from "react";
import axios from "axios";
import { AddJob } from "./JobAdd";
type Job = {
    id: number;
    company_name: string;
    position: string;
    date_applied: string;
    status: string;
    link?: string;
    notes?: string;
};

export const JobList = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const fetchJobs = async () => {
        try {
            const { data } = await axios.get<Job[]>('jobs');
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    if (loading) {
        return <div className="container mt-5 text-center">Loading...</div>;
    }

    if (!jobs || jobs.length === 0) {
        return <div className="container mt-5 text-center">No jobs found.</div>;
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Your Job Applications</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)} // 🔥 toggle form
                >
                    {showAddForm ? 'Close Form' : 'Add New Job'}
                </button>
            </div>

            {showAddForm && (
                <div className="mb-5">
                    <AddJob onJobAdded={fetchJobs}/>
                </div>
            )}

            <h2>Your Job Applications</h2>

            {jobs.length === 0 ? (  // ✅ now jobs is always array
                <div>No jobs found.</div>
            ) : (
                <table className="table table-bordered mt-3">
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Position</th>
                            <th>Date Applied</th>
                            <th>Status</th>
                            <th>Link</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map(job => (
                            <tr key={job.id}>
                                <td>{job.company_name}</td>
                                <td>{job.position}</td>
                                <td>{new Date(job.date_applied).toLocaleDateString()}</td>
                                <td>{job.status}</td>
                                <td>
                                    {job.link ? (
                                        <a href={job.link} target="_blank" rel="noopener noreferrer">View</a>
                                    ) : (
                                        'N/A'
                                    )}
                                </td>
                                <td>{job.notes || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
