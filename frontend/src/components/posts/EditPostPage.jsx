import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserStore } from "../../stores/userStore";
import toast from "react-hot-toast";
import { ArrowLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

const EditPostPage = () => {
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Get post ID from URL
  const { isAuthenticated, user } = useUserStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to edit posts");
      navigate("/");
      return;
    }

    // Fetch post data
    fetchPost();
  }, [isAuthenticated, navigate, id]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      
      // First, fetch the user's posts
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8070'}/api/posts/posts/${user._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for sending cookies
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      const posts = data.postsByUser || [];
      
      // Find the specific post by ID
      const post = posts.find(post => post._id === id);
      
      if (!post) {
        toast.error("Post not found");
        navigate("/my-posts");
        return;
      }
      
      // Set the form data
      setDescription(post.description);
      setNote(post.note);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error(error.message || "Failed to load post");
      navigate("/my-posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim() || !note.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8070'}/api/posts/post/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for sending cookies
          body: JSON.stringify({
            description,
            note
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update post");
      }
      
      toast.success("Post updated successfully!");
      // Navigate back to post list
      navigate("/my-posts");
      
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto px-4 py-12"
    >
      <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-slate-700/50">
        <div className="flex items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/my-posts")}
            className="mr-4 p-2 rounded-xl bg-slate-700/50 text-slate-300 hover:text-sky-400 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </motion.button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400">
            Edit Post
          </h1>
        </div>
        
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
            <span>{isSubmitting ? "Updating Post..." : "Update Post"}</span>
            {!isSubmitting && (
              <PaperAirplaneIcon className="w-5 h-5 transform rotate-90" />
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default EditPostPage;