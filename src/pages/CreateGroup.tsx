
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Users, Calendar, Hash, Layout } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCollage, GridTemplate } from "@/context/CollageContext";
import { toast } from "sonner";
import { GridPreview } from "@/components/GridPreview";

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: "",
    yearOfPassing: "",
    totalMembers: "",
    gridTemplate: "square" as GridTemplate
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createGroup } = useCollage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const groupId = createGroup({
        name: formData.name,
        yearOfPassing: formData.yearOfPassing,
        totalMembers: parseInt(formData.totalMembers),
        gridTemplate: formData.gridTemplate
      });

      toast.success("Group created successfully!");
      navigate(`/join/${groupId}`);
    } catch (error) {
      toast.error("Failed to create group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidForm = formData.name && formData.yearOfPassing && formData.totalMembers && parseInt(formData.totalMembers) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Group</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Users className="mr-2 h-6 w-6 text-purple-600" />
                Group Details
              </CardTitle>
              <CardDescription>
                Fill in your group information to get started with your farewell T-shirt design.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="groupName" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Group Name
                  </Label>
                  <Input
                    id="groupName"
                    placeholder="e.g., Computer Science Batch 2024"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearOfPassing" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Year of Passing
                  </Label>
                  <Input
                    id="yearOfPassing"
                    placeholder="e.g., 2024"
                    value={formData.yearOfPassing}
                    onChange={(e) => setFormData({ ...formData, yearOfPassing: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalMembers" className="flex items-center">
                    <Hash className="mr-2 h-4 w-4" />
                    Total Number of Members
                  </Label>
                  <Input
                    id="totalMembers"
                    type="number"
                    min="1"
                    max="50"
                    placeholder="e.g., 20"
                    value={formData.totalMembers}
                    onChange={(e) => setFormData({ ...formData, totalMembers: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center">
                    <Layout className="mr-2 h-4 w-4" />
                    Grid Template
                  </Label>
                  <RadioGroup
                    value={formData.gridTemplate}
                    onValueChange={(value: GridTemplate) => setFormData({ ...formData, gridTemplate: value })}
                    className="grid grid-cols-3 gap-4"
                  >
                    {(['square', 'hexagonal', 'circle'] as GridTemplate[]).map((template) => (
                      <div key={template} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                        <RadioGroupItem value={template} id={template} />
                        <Label htmlFor={template} className="capitalize cursor-pointer">
                          {template}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={!isValidForm || isSubmitting}
                >
                  {isSubmitting ? "Creating Group..." : "Create Group"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Preview</CardTitle>
              <CardDescription>
                See how your selected grid template will look
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[400px]">
              <GridPreview 
                template={formData.gridTemplate}
                memberCount={parseInt(formData.totalMembers) || 9}
                size="large"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
