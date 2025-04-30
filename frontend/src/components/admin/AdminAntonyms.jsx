import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useAdminStore } from "../../stores/adminStore"; // Import the admin store
import axios from "axios"; // Import axios for better request handling

export default function AdminAntonyms() {
  const [antonyms, setAntonyms] = useState([]);
  const [word, setWord] = useState("");
  const [antonymFields, setAntonymFields] = useState([""]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get admin authentication state
  const { isAuthenticated, admin } = useAdminStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    admin: state.admin,
  }));

  // State for update mode
  const [updateMode, setUpdateMode] = useState(false);
  const [currentAntonymId, setCurrentAntonymId] = useState(null);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch antonyms from backend
  useEffect(() => {
    if (isAuthenticated) {
      fetchAntonyms();
    }
  }, [isAuthenticated]);

  const fetchAntonyms = async () => {
    try {
      setLoading(true);
      // Use axios with withCredentials to send cookies
      const response = await axios.get(
        "http://localhost:8070/antonyms/antonymTable",
        { withCredentials: true }
      );

      setAntonyms(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching antonyms:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch antonyms. Please ensure you're logged in as an admin."
      );
      setAntonyms([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new antonym input field
  const handleAddAntonymField = () => {
    setAntonymFields([...antonymFields, ""]); // Add a new empty input field
  };

  // Handle change in an antonym input field
  const handleAntonymChange = (index, value) => {
    const newFields = [...antonymFields];
    newFields[index] = value;
    setAntonymFields(newFields);
  };

  // Handle removing an antonym input field
  const handleRemoveAntonymField = (index) => {
    const newFields = antonymFields.filter((_, i) => i !== index);
    setAntonymFields(newFields);
  };

  // Handle adding antonyms to the word
  const handleAddAntonyms = async () => {
    const antonymsList = antonymFields.filter((field) => field.trim() !== "");
    if (!word || antonymsList.length === 0) {
      return alert("Please enter a word and at least one antonym.");
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8070/antonyms/AntonymAdd",
        {
          word: word,
          antonym: antonymsList,
          status: "active", // Default status
        },
        { withCredentials: true } // Include credentials (cookies)
      );

      setWord(""); // Clear word input
      setAntonymFields([""]); // Reset antonym input fields
      fetchAntonyms(); // Fetch updated antonyms list
      setError(null);
    } catch (err) {
      console.error("Error adding antonyms:", err);
      setError(err.response?.data?.message || "Failed to add antonyms");
    } finally {
      setLoading(false);
    }
  };

  // Handle editing an antonym
  const handleEditAntonym = async (id, word, antonyms) => {
    setUpdateMode(true);
    setCurrentAntonymId(id);
    setWord(word);
    setAntonymFields(antonyms); // Prepopulate the antonyms
  };

  // Handle cancel update
  const handleCancelUpdate = () => {
    setUpdateMode(false);
    setCurrentAntonymId(null);
    setWord("");
    setAntonymFields([""]);
  };

  // Handle saving the updated antonyms
  const handleSaveUpdate = async () => {
    const antonymsList = antonymFields.filter((field) => field.trim() !== "");
    if (!word || antonymsList.length === 0) {
      return alert("Please enter a word and at least one antonym.");
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:8070/antonyms/updateAntonym/${currentAntonymId}`,
        {
          word: word,
          antonym: antonymsList,
          status: "active",
        },
        { withCredentials: true } // Include credentials (cookies)
      );

      setUpdateMode(false);
      setCurrentAntonymId(null);
      setWord("");
      setAntonymFields([""]);
      fetchAntonyms(); // Fetch updated antonyms list
      setError(null);
    } catch (err) {
      console.error("Error updating antonyms:", err);
      setError(err.response?.data?.message || "Failed to update antonyms");
    } finally {
      setLoading(false);
    }
  };

  // Handle showing the delete confirmation modal
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Handle deleting an antonym
  const handleDeleteAntonym = async () => {
    if (!deleteId) return;

    try {
      setLoading(true);
      const response = await axios.delete(
        `http://localhost:8070/antonyms/deleteAntonym/${deleteId}`,
        { withCredentials: true } // Include credentials (cookies)
      );

      fetchAntonyms(); // Fetch updated antonyms list
      setShowDeleteModal(false); // Close modal after deletion
      setError(null);
    } catch (err) {
      console.error("Error deleting antonym:", err);
      setError(err.response?.data?.message || "Failed to delete antonym");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Handle canceling delete action
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // Show authentication error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
          <h2 className="text-red-400 font-semibold">
            Authentication Required
          </h2>
          <p className="text-gray-300">
            You must be logged in as an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white">Admin Antonyms</h1>
      <p className="text-gray-400 mt-2 mb-4">Manage antonyms below.</p>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
          <p className="text-blue-400">Loading...</p>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        {/* Word Input fixed to the left */}
        <div className="w-1/2">
          <input
            type="text"
            placeholder="Enter word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
          />
        </div>

        {/* Antonyms Input on the right */}
        <div className="flex-1">
          {antonymFields.map((field, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter antonym"
                value={field}
                onChange={(e) => handleAntonymChange(index, e.target.value)}
                className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
              />
              {antonymFields.length > 1 && (
                <button
                  onClick={() => handleRemoveAntonymField(index)}
                  className="text-red-500"
                  disabled={loading}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {!updateMode && (
          <button
            onClick={handleAddAntonymField}
            className="bg-gradient-to-r from-blue-950 to-blue-600 px-4 py-2 rounded text-white hover:from-blue-600 hover:to-blue-950 mt-4 border-2 border-blue-400"
            disabled={loading}
          >
            Add Another Antonym
          </button>
        )}
        {updateMode ? (
          <>
            <button
              onClick={handleAddAntonymField}
              className="bg-gradient-to-r from-blue-950 to-blue-600 px-4 py-2 rounded text-white hover:from-blue-600 hover:to-blue-950 mt-4 border-2 border-blue-400"
              disabled={loading}
            >
              Add Another Antonym
            </button>
            <button
              onClick={handleSaveUpdate}
              className="bg-gradient-to-r from-yellow-600 to-orange-700 px-4 py-2 rounded text-white hover:from-orange-700 hover:to-yellow-600 mt-4 border-2 border-yellow-400"
              disabled={loading}
            >
              Save Update
            </button>
            <button
              onClick={handleCancelUpdate}
              className="bg-gradient-to-r from-red-500 to-red-800 px-4 py-2 rounded text-white hover:from-red-800 hover:to-red-600 mt-4 border-2 border-red-200"
              disabled={loading}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleAddAntonyms}
            className="bg-gradient-to-r from-green-600 to-green-950 px-4 py-2 rounded text-white hover:from-green-950 hover:to-green-600 mt-4 border-2 border-green-400"
            disabled={loading}
          >
            Add Antonyms
          </button>
        )}
      </div>

      {/* Antonyms List */}
      <div className="mt-6 overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full table-auto text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-800 to-green-800 text-gray-300">
              <th className="py-3 px-4 text-left">Word</th>
              <th className="py-3 px-4 text-left">Antonyms</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {antonyms.length > 0 ? (
              antonyms.map((antonym) => (
                <tr
                  key={antonym._id}
                  className="hover:bg-gradient-to-r hover:from-purple-950 hover:to-blue-950 transition duration-150"
                >
                  <td className="py-3 px-4">{antonym.word}</td>
                  <td className="py-3 px-4">
                    {Array.isArray(antonym.antonym)
                      ? antonym.antonym.join(", ")
                      : antonym.antonym}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() =>
                          handleEditAntonym(
                            antonym._id,
                            antonym.word,
                            Array.isArray(antonym.antonym)
                              ? antonym.antonym
                              : [antonym.antonym]
                          )
                        }
                        className="text-yellow-400"
                        disabled={loading}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(antonym._id)}
                        className="text-red-600"
                        disabled={loading}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-4 px-4 text-center text-gray-400">
                  {loading ? "Loading antonyms..." : "No antonyms found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gradient-to-br from-blue-600 via-blue-950 to-black p-6 rounded-lg shadow-lg border-2">
            <h2 className="text-lg font-semibold">
              Are you sure you want to delete this antonym?
            </h2>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={handleDeleteAntonym}
                className="bg-red-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-500 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
