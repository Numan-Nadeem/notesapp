import React from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

const Homepage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to Notsify
        </h1>
        {user && (
          <p className="text-xl text-white mb-8">
            Hello, {user.name || user.email}! Ready to organize your thoughts?
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-[#171717] p-6 rounded-lg shadow-md border border-neutral-800">
          <h2 className="text-2xl font-semibold text-white mb-4">Your Notes</h2>
          <p className="text-white mb-4">
            Create, edit, and organize all your notes in one place.
          </p>
          <Link
            to="/notes"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View My Notes
          </Link>
        </div>

        <div className="bg-[#171717] p-6 rounded-lg shadow-md border border-neutral-800">
          <h2 className="text-2xl font-semibold text-white mb-4 ">
            Quick Actions
          </h2>
          <p className="text-white mb-4">
            Get started with creating your first note or explore features.
          </p>
          <Link
            to="/notes"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Create New Note
          </Link>
        </div>
      </div>

      <div className="bg-[#171717] p-8 rounded-lg border border-neutral-800">
        <h2 className="text-2xl font-semibold text-white mb-4 ">Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-blue-600 text-3xl mb-2">📝</div>
            <h3 className="text-white font-semibold mb-2">Easy Note Taking</h3>
            <p className="text-sm text-white">
              Create and edit notes with a simple, intuitive interface.
            </p>
          </div>
          <div className="text-center">
            <div className="text-green-600 text-3xl mb-2">📁</div>
            <h3 className="text-white font-semibold mb-2">Organization</h3>
            <p className="text-sm text-white">
              Keep your notes organized and easily searchable.
            </p>
          </div>
          <div className="text-center">
            <div className="text-purple-600 text-3xl mb-2">☁️</div>
            <h3 className="text-white font-semibold mb-2">Cloud Sync</h3>
            <p className="text-sm text-white">
              Access your notes from anywhere, anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
