"use client";
import DashboardStats from '@/components/DashboardSideBar/DashboardStats';
import { useSession } from '@/lib/auth-client';
import React from 'react';
import { Briefcase, Check, FileText, Person } from "@gravity-ui/icons";

const RecruiterPage = () => {
    const {data : session , isPending} = useSession();

    if (isPending) {
        return <p>Loading...</p>
    }
    const user = session?.user;S
    const defaultStats = [
  { icon: FileText, label: "Total Job Posts", value: 48 },
  { icon: Person, label: "Total Applicants", value: 1284 },
  { icon: Briefcase, label: "Active Jobs", value: 18 },
  { icon: Check, label: "Jobs Closed", value: 32 },
];
    console.log("I am the session",session);
    return (
        <div>
            <h2 className='text-4xl'>Welcome back, {user?.name}</h2>
            <DashboardStats defaultStats={defaultStats}></DashboardStats>
        </div>
    );
};

export default RecruiterPage;