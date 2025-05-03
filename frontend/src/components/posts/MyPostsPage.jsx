import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserStore } from "../../stores/userStore";
import toast from "react-hot-toast";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import ConfirmDialog from "./ConfirmDialog";
import { jsPDF } from "jspdf"; // ✅ Add this line

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to view your posts");
      navigate("/");
      return;
    }
    fetchPosts();
  }, [isAuthenticated, navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8070"}/api/posts/posts/${user._id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data.postsByUser || []);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (postId) => {
    setPostToDelete(postId);
    setConfirmDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8070"}/api/posts/post/delete/${postToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to delete post");

      toast.success("Post deleted successfully");
      setPosts(posts.filter((post) => post._id !== postToDelete));
      setPostToDelete(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(36, 99, 235); // Sky blue
    doc.text("My Posts", 14, 20);
  
    let y = 30;
    posts.forEach((post, index) => {
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text(`Post ${index + 1}`, 14, y);
      y += 8;
  
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(50);
  
      const wrapText = (text, maxWidth) =>
        doc.splitTextToSize(text, maxWidth);
  
      const descriptionLines = wrapText(`Description: ${post.description}`, 180);
      doc.text(descriptionLines, 14, y);
      y += descriptionLines.length * 6;
  
      const noteLines = wrapText(`Note: ${post.note}`, 180);
      doc.text(noteLines, 14, y);
      y += noteLines.length * 6;
  
      // Draw a line between posts
      doc.setDrawColor(200);
      doc.line(14, y, 196, y);
      y += 10;
  
      // Start new page if near bottom
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
    });
  
    doc.save("my-posts.pdf");
  };

  const filteredPosts = posts.filter((post) =>
    post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.note.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-4xl mx-auto px-4 py-12"
      >
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-slate-700/50">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400">
              My Posts
            </h1>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/add-post")}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-300"
              >
                Add New Post
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generatePDF}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
              >
                Download PDF
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full px-4 py-2 rounded-lg bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-300 mb-4">No posts found.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/add-post")}
                className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-300"
              >
                Create Your First Post
              </motion.button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post._id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 shadow-md"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-sky-400 mb-2">Description</h3>
                    <p className="text-slate-300 whitespace-pre-line">{post.description}</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-sky-400 mb-2">Note</h3>
                    <p className="text-slate-300 whitespace-pre-line">{post.note}</p>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
                      onClick={() => navigate(`/edit-post/${post._id}`)}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      onClick={() => confirmDelete(post._id)}
                      disabled={isDeleting}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default MyPostsPage;
