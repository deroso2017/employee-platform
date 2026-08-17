"use client";

import { useState, useEffect } from "react";
import { departmentApi } from "@/lib/api";
import type { Department } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export default function DepartmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  useEffect(() => {
    departmentApi.getAll().then(({ data }) => setDepartments(data));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await departmentApi.create(name);
      setDepartments((prev) => [...prev, data]);
      setName("");
      toast.add({ title: "Department created", description: `"${data.name}" was added successfully.`, type: "success" });
    } catch {
      toast.add({ title: "Error", description: "Failed to create department.", type: "error" });
    } finally {
      setCreating(false);
    }
  }

  function startEdit(dept: Department) {
    setEditingId(dept.id);
    setEditName(dept.name);
  }

  async function handleUpdate(id: number) {
    setSaving(true);
    try {
      const { data } = await departmentApi.update(id, editName);
      setDepartments((prev) => prev.map((d) => (d.id === id ? data : d)));
      setEditingId(null);
      toast.add({ title: "Department updated", description: `"${data.name}" was saved.`, type: "success" });
    } catch {
      toast.add({ title: "Error", description: "Failed to update department.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this department?")) return;
    try {
      await departmentApi.delete(id);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      toast.add({ title: "Department deleted", type: "success" });
    } catch {
      toast.add({ title: "Error", description: "Failed to delete department.", type: "error" });
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-8">Departments</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create form */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">New Department</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Engineering"
                  required
                />
                <Button type="submit" disabled={creating} className="w-full">
                  {creating ? "Creating…" : "Create"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Department list */}
          <div className="lg:col-span-2">
            {departments.length === 0 ? (
              <div className="flex items-center justify-center h-40 rounded-xl border border-dashed text-muted-foreground text-sm">
                No departments yet. Create one to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {departments.map((dept) => (
                  <Card key={dept.id} className="group transition-shadow hover:shadow-md">
                    <CardContent className="pt-5 pb-4 px-5">
                      {editingId === dept.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            disabled={saving}
                            onClick={() => handleUpdate(dept.id)}
                          >
                            {saving ? "…" : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                              {dept.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{dept.name}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => startEdit(dept)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(dept.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
