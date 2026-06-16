"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminPageShell from "../../../../../components/AdminPageShell";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import BlogForm from "../../BlogForm";
import api from "../../../../../lib/api";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const { data } = await api.get("/super-admin/blogs", { params: { includeDrafts: true } });
        const found = (data.blogs || []).find((item) => item._id === params.id);
        if (!found) {
          router.push("/admin/blogs");
          return;
        }
        setBlog({
          title: found.title || "",
          slug: found.slug || "",
          excerpt: found.excerpt || "",
          coverImage: found.coverImage || "",
          content: found.content || "",
          status: found.status || "draft"
        });
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [params.id, router]);

  return (
    <AdminPageShell
      title="Edit Blog"
      subtitle="Update blog content and return to the table after save."
      breadcrumbs={["Dashboard", "Blogs", "Edit"]}
    >
      {loading ? <LoadingSpinner label="Loading blog..." /> : <BlogForm initialData={blog} blogId={params.id} />}
    </AdminPageShell>
  );
}
