"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AccountShell from "../../components/AccountShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import LoadingSpinner from "../../components/LoadingSpinner";
import api, { extractError } from "../../lib/api";
import { MissionCard } from "../../components/rewards/MissionCard";

export default function MissionsPage() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/missions/my");
      setMissions(data.missions || []);
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const claimMission = async (missionId) => {
    try {
      setClaimingId(missionId);
      await api.post(`/missions/claim/${missionId}`);
      toast.success("Mission reward claimed");
      await load();
    } catch (error) {
      toast.error(extractError(error));
    } finally {
      setClaimingId("");
    }
  };

  return (
    <ProtectedRoute>
      <AccountShell title="Missions" subtitle="Complete Coupon Hunt missions, track progress, and claim extra CouponX coins.">
        {loading ? <LoadingSpinner label="Loading missions..." /> : (
          <div className="grid gap-5 lg:grid-cols-2">
            {missions.length ? missions.map((mission) => (
              <MissionCard key={mission._id} mission={mission} onClaim={claimMission} claiming={claimingId === (mission.missionId?._id || mission._id)} />
            )) : <div className="rounded-[28px] border border-dashed border-emerald-200 px-6 py-10 text-center text-sm text-slate-500">No active missions yet.</div>}
          </div>
        )}
      </AccountShell>
    </ProtectedRoute>
  );
}
