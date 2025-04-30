import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useAdminStore } from "../../stores/adminStore"; // Import the admin store
import axios from "axios"; // Import axios for better request handling

export default function AdminSynonym() {
  const [synonyms, setSynonyms] = useState([]);
  const [word, setWord] = useState("");
  const [synonymFields, setSynonymFields] = useState([""]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get admin authentication state
  const { isAuthenticated, admin } = useAdminStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    admin: state.admin,
  }));

  // State for update mode
  const [updateMode, setUpdateMode] = useState(false);
  const [currentSynonymId, setCurrentSynonymId] = useState(null);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch synonyms from backend
  useEffect(() => {
    if (isAuthenticated) {
      fetchSynonyms();
    }
  }, [isAuthenticated]);

  const fetchSynonyms = async () => {
    try {
      setLoading(true);
      // Use axios with withCredentials to send cookies
      const response = await axios.get(
        "http://localhost:8070/synonyms/synonymTable",
        { withCredentials: true }
      );

      setSynonyms(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching synonyms:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch synonyms. Please ensure you're logged in as an admin."
      );
      setSynonyms([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new synonym input field
  const handleAddSynonymField = () => {
    setSynonymFields([...synonymFields, ""]); // Add a new empty input field
  };

  // Handle change in a synonym input field
  const handleSynonymChange = (index, value) => {
    const newFields = [...synonymFields];
    newFields[index] = value;
    setSynonymFields(newFields);
  };

  // Handle removing a synonym input field
  const handleRemoveSynonymField = (index) => {
    const newFields = synonymFields.filter((_, i) => i !== index);
    setSynonymFields(newFields);
  };

  // Handle adding synonyms to the word
  const handleAddSynonyms = async () => {
    const synonymsList = synonymFields.filter((field) => field.trim() !== "");
    if (!word || synonymsList.length === 0) {
      return alert("Please enter a word and at least one synonym.");
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8070/synonyms/SynonymAdd",
        {
          word: word,
          synonym: synonymsList,
          status: "active", // Default status
        },
        { withCredentials: true } // Include credentials (cookies)
      );

      setWord(""); // Clear word input
      setSynonymFields([""]); // Reset synonym input fields
      fetchSynonyms(); // Fetch updated synonyms list
      setError(null);
    } catch (err) {
      console.error("Error adding synonyms:", err);
      setError(err.response?.data?.message || "Failed to add synonyms");
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a synonym
  const handleEditSynonym = async (id, word, synonyms) => {
    setUpdateMode(true);
    setCurrentSynonymId(id);
    setWord(word);
    setSynonymFields(synonyms); // Prepopulate the synonyms
  };

  // Handle cancel update
  const handleCancelUpdate = () => {
    setUpdateMode(false);
    setCurrentSynonymId(null);
    setWord("");
    setSynonymFields([""]);
  };

  // Handle saving the updated synonyms
  const handleSaveUpdate = async () => {
    const synonymsList = synonymFields.filter((field) => field.trim() !== "");
    if (!word || synonymsList.length === 0) {
      return alert("Please enter a word and at least one synonym.");
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:8070/synonyms/updateSynonym/${currentSynonymId}`,
        {
          word: word,
          synonym: synonymsList,
          status: "active",
        },
        { withCredentials: true } // Include credentials (cookies)
      );

      setUpdateMode(false);
      setCurrentSynonymId(null);
      setWord("");
      setSynonymFields([""]);
      fetchSynonyms(); // Fetch updated synonyms list
      setError(null);
    } catch (err) {
      console.error("Error updating synonyms:", err);
      setError(err.response?.data?.message || "Failed to update synonyms");
    } finally {
      setLoading(false);
    }
  };

  // Handle showing the delete confirmation modal
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Handle deleting a synonym
  const handleDeleteSynonym = async () => {
    if (!deleteId) return;

    try {
      setLoading(true);
      const response = await axios.delete(
        `http://localhost:8070/synonyms/deleteSynonym/${deleteId}`,
        { withCredentials: true } // Include credentials (cookies)
      );

      fetchSynonyms(); // Fetch updated synonyms list
      setShowDeleteModal(false); // Close modal after deletion
      setError(null);
    } catch (err) {
      console.error("Error deleting synonym:", err);
      setError(err.response?.data?.message || "Failed to delete synonym");
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
      <h1 className="text-3xl font-bold text-white">Admin Synonyms</h1>
      <p className="text-gray-400 mt-2 mb-4">Manage synonyms below.</p>

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

        {/* Synonyms Input on the right */}
        <div className="flex-1">
          {synonymFields.map((field, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter synonym"
                value={field}
                onChange={(e) => handleSynonymChange(index, e.target.value)}
                className="p-2 bg-gray-800 text-white border border-gray-700 rounded w-full"
              />
              {synonymFields.length > 1 && (
                <button
                  onClick={() => handleRemoveSynonymField(index)}
                  className="text-red-500"
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
            onClick={handleAddSynonymField}
            className="bg-gradient-to-r from-blue-950 to-blue-600 px-4 py-2 rounded text-white hover:from-blue-600 hover:to-blue-950 mt-4 border-2 border-blue-400"
            disabled={loading}
          >
            Add Another Synonym
          </button>
        )}
        {updateMode ? (
          <>
            <button
              onClick={handleAddSynonymField}
              className="bg-gradient-to-r from-blue-950 to-blue-600 px-4 py-2 rounded text-white hover:from-blue-600 hover:to-blue-950 mt-4 border-2 border-blue-400"
              disabled={loading}
            >
              Add Another Synonym
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
            onClick={handleAddSynonyms}
            className="bg-gradient-to-r from-green-600 to-green-950 px-4 py-2 rounded text-white hover:from-green-950 hover:to-green-600 mt-4 border-2 border-green-400"
            disabled={loading}
          >
            Add Synonyms
          </button>
        )}
      </div>

      {/* Synonyms List */}
      <div className="mt-6 overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full table-auto text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-800 to-green-800 text-gray-300">
              <th className="py-3 px-4 text-left">Word</th>
              <th className="py-3 px-4 text-left">Synonyms</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {synonyms.length > 0 ? (
              synonyms.map((synonym) => (
                <tr
                  key={synonym._id}
                  className="hover:bg-gradient-to-r hover:from-purple-950 hover:to-blue-950 transition duration-150"
                >
                  <td className="py-3 px-4">{synonym.word}</td>
                  <td className="py-3 px-4">{synonym.synonym.join(", ")}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() =>
                          handleEditSynonym(
                            synonym._id,
                            synonym.word,
                            synonym.synonym
                          )
                        }
                        className="text-yellow-400"
                        disabled={loading}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(synonym._id)}
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
                  {loading ? "Loading synonyms..." : "No synonyms found"}
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
              Are you sure you want to delete this synonym?
            </h2>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={handleDeleteSynonym}
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
