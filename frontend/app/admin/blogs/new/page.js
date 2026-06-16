import AdminPageShell from "../../../../components/AdminPageShell";
import BlogForm from "../BlogForm";

export default function NewBlogPage() {
  return (
    <AdminPageShell
      title="Add New Blog"
      subtitle="Create a new blog post and return to the table after save."
      breadcrumbs={["Dashboard", "Blogs", "Add New"]}
    >
      <BlogForm />
    </AdminPageShell>
  );
}
