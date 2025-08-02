
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Users, Calendar, Hash, Layout, Type } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCollage, GridTemplate } from "@/context/CollageContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { GridPreview } from "@/components/GridPreview";
import { ImageUpload } from "@/components/ImageUpload";

// Available square template numbers
const AVAILABLE_SQUARE_TEMPLATES = [62, 72, 73, 121, 122, 123, 124, 125, 126, 127, 128];

// Helper function to select the correct template number
const getSquareTemplateNumber = (memberCount: number): number => {
  if (AVAILABLE_SQUARE_TEMPLATES.includes(memberCount)) {
    return memberCount;
  }
  // Return the minimum available number if the input doesn't match any template
  return Math.min(...AVAILABLE_SQUARE_TEMPLATES);
};

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: "",
    yearOfPassing: "",
    totalMembers: "",
    gridTemplate: "square" as GridTemplate,
    logoFile: null as File | null,
    logoPreview: "",
    customText: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createGroup, isLoading } = useCollage();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Show loading state while context is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
            <p className="text-gray-600">Initializing application...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleImageChange = (file: File | null, preview: string) => {
    setFormData(prev => ({
      ...prev,
      logoFile: file,
      logoPreview: preview
    }));
  };

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

      // Update user data to mark as leader and set groupId
      if (user) {
        updateUser({ 
          isLeader: true, 
          groupId 
        });
      }

      toast.success("Group created successfully!");
      navigate(`/dashboard`);
    } catch (error) {
      toast.error("Failed to create group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidForm = formData.name && formData.yearOfPassing && formData.totalMembers && parseInt(formData.totalMembers) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-4">
      <div className="container mx-auto max-w-5xl">
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
                    max="150"
                    placeholder="e.g., 20"
                    value={formData.totalMembers}
                    onChange={(e) => setFormData({ ...formData, totalMembers: e.target.value })}
                    required
                  />
                </div>

                {/* Logo Upload */}
                <ImageUpload
                  onImageChange={handleImageChange}
                  currentPreview={formData.logoPreview}
                  label="Group Logo (Optional)"
                />

                {/* Custom Text */}
                {/* <div className="space-y-2">
                  <Label htmlFor="customText" className="flex items-center">
                    <Type className="mr-2 h-4 w-4" />
                    Custom Text (Optional)
                  </Label>
                  <Textarea
                    id="customText"
                    placeholder="e.g., Forever Friends, Class of 2024, etc."
                    value={formData.customText}
                    onChange={(e) => setFormData({ ...formData, customText: e.target.value })}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">This text will appear on your t-shirt design</p>
                </div> */}

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

          {/* Enhanced Preview */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Live Preview</CardTitle>
              <CardDescription>
                See how your selected grid template will look
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center min-h-[300px] bg-gradient-to-br from-gray-50 to-white rounded-xl p-4">
                {formData.gridTemplate === "square" ? (
                  <img
                    src={`/square/${getSquareTemplateNumber(parseInt(formData.totalMembers) || 62)}.png`}
                    alt={`Square grid template for ${getSquareTemplateNumber(parseInt(formData.totalMembers) || 62)} members`}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <GridPreview 
                    template={formData.gridTemplate}
                    memberCount={parseInt(formData.totalMembers) || 9}
                    size="large"
                  />
                )}
              </div>
              
              {/* Preview customizations */}
              {formData.logoPreview && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700 mb-2">Logo Preview:</p>
                  <img 
                    src={formData.logoPreview} 
                    alt="Logo preview" 
                    className="h-16 w-16 object-cover rounded-lg mx-auto border-2 border-purple-200"
                  />
                </div>
              )}
              
              {formData.customText && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 mb-2">Custom Text:</p>
                  <p className="font-semibold text-blue-800">"{formData.customText}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
