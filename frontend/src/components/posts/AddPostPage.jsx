import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserStore } from "../../stores/userStore";
import toast from "react-hot-toast";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

const AddPostPage = () => {
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to create a post");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim() || !note.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8070'}/api/posts/post/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for sending cookies
        body: JSON.stringify({
          description,
          note
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create post");
      }
      
      toast.success("Post created successfully!");
      // Clear form
      setDescription("");
      setNote("");
      
      // Optionally redirect to another page
      // navigate("/my-posts");
      
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto px-4 py-12"
    >
      <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-slate-700/50">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 mb-6">
          Create New Post
        </h1>
        
        {isAuthenticated && user ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label 
                htmlFor="description" 
                className="block text-sky-400 font-medium mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter post description..."
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all duration-300 min-h-32"
                required
              />
            </div>
            
            <div className="mb-6">
              <label 
                htmlFor="note" 
                className="block text-sky-400 font-medium mb-2"
              >
                Note
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter additional notes..."
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all duration-300 min-h-24"
                required
              />
            </div>
            
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full px-6 py-3 rounded-xl ${
                isSubmitting 
                  ? "bg-slate-700 text-slate-300" 
                  : "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
              } font-medium flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-300`}
            >
              <span>{isSubmitting ? "Creating Post..." : "Create Post"}</span>
              {!isSubmitting && (
                <PaperAirplaneIcon className="w-5 h-5 transform rotate-90" />
              )}
            </motion.button>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-300 mb-4">
              You need to be logged in to create a post.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AddPostPage;