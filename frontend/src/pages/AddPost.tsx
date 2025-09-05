import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./sub-components/Navbar";
import { AppDispatch, RootState } from "@/store/store";
import { addNewPost, clearAllPostErrors } from "@/store/slices/postSlice";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { resetPostSlice } from "@/store/slices/commentSlice";

export default function AddPost() {
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { loading, postError, message } = useSelector(
    (state: RootState) => state.post
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("content", content);
    if (linkUrl.trim() !== "") {
      formData.append("linkUrl", linkUrl);
    }
    if (image) {
      formData.append("image", image);
    }

    dispatch(addNewPost(formData));
  };

  // ✅ Toast effect (success + error)
  useEffect(() => {
    if (postError) {
      toast.error(postError);
      dispatch(clearAllPostErrors());
    }

    if (message) {
      toast.success(message || "Post created successfully!");
      dispatch(resetPostSlice());
      setContent("");
      setLinkUrl("");
      setImage(null);
    }
  }, [postError, message, dispatch]);

  // ✅ Image preview management
  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  // ✅ Reset slice on unmount (prevents old messages showing on other pages)
  useEffect(() => {
    return () => {
      dispatch(resetPostSlice());
      dispatch(clearAllPostErrors());
    };
  }, [dispatch]);


  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab="profile" setActiveTab={() => {}} />

      <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Post</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-violet-500 focus:ring-violet-500"
              placeholder="What's on your mind?"
              required
            />
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Link (optional)
            </label>
            <Input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-violet-500 focus:ring-violet-500"
              placeholder="https://example.com"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image
            </label>

            {/* Preview container */}
            <div className="mt-3 flex flex-col gap-3">
              {previewUrl && (
                <div className="w-full max-h-80 overflow-hidden rounded-lg border">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}

              {/* File upload input */}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImage(e.target.files ? e.target.files[0] : null)
                }
                className="text-sm text-gray-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-700 text-white py-2 px-4 rounded-lg hover:bg-violet-800 transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
