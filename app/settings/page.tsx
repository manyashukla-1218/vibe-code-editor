"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Code, 
  Trash2,
  Save
} from "lucide-react"

export default function SettingsPage() {
  // Profile Settings State
  const [username, setUsername] = useState("Nikki Shukla")
  const [email, setEmail] = useState("nikki@example.com")
  
  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  
  // Editor Settings State
  const [fontSize, setFontSize] = useState("14")
  const [tabSize, setTabSize] = useState("2")
  const [autoSave, setAutoSave] = useState(true)
  const [wordWrap, setWordWrap] = useState(true)
  
  // Theme Settings State
  const [darkMode, setDarkMode] = useState(true)
  const [highContrast, setHighContrast] = useState(false)

  // Apply dark mode to document
  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled)
    if (enabled) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Apply high contrast
  const toggleHighContrast = (enabled: boolean) => {
    setHighContrast(enabled)
    if (enabled) {
      document.documentElement.style.setProperty('--contrast', 'high')
    } else {
      document.documentElement.style.setProperty('--contrast', 'normal')
    }
  }

  // Delete Account Handler
  const handleDeleteAccount = () => {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:')
    if (confirmation === "DELETE") {
      alert("Account deletion initiated. This would delete your account in production.")
      // Here you would call your API to delete account
      // router.push('/') // Redirect after deletion
    } else if (confirmation !== null) {
      alert("Account deletion cancelled - text didn't match")
    }
  }

  // Save Settings Handler
  const handleSaveSettings = () => {
    // Here you would save to your backend/database
    console.log("Settings saved:", {
      username,
      email,
      emailNotifications,
      pushNotifications,
      fontSize,
      tabSize,
      autoSave,
      wordWrap,
      darkMode,
      highContrast,
    })
    alert("Settings saved successfully!")
  }

  // Reset Settings Handler
  const handleResetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      setUsername("Nikki Shukla")
      setEmail("nikki@example.com")
      setEmailNotifications(true)
      setPushNotifications(false)
      setFontSize("14")
      setTabSize("2")
      setAutoSave(true)
      setWordWrap(true)
      setDarkMode(true)
      setHighContrast(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>
          <Separator />
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <Separator />
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your playgrounds
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications for important updates
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </div>
        </div>

        {/* Editor Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Editor Preferences</h2>
          </div>
          <Separator />
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <Input
                  id="font-size"
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  min="10"
                  max="24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tab-size">Tab Size</Label>
                <Input
                  id="tab-size"
                  type="number"
                  value={tabSize}
                  onChange={(e) => setTabSize(e.target.value)}
                  min="2"
                  max="8"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto Save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save your work
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="word-wrap">Word Wrap</Label>
                <p className="text-sm text-muted-foreground">
                  Wrap long lines in the editor
                </p>
              </div>
              <Switch
                id="word-wrap"
                checked={wordWrap}
                onCheckedChange={setWordWrap}
              />
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Appearance</h2>
          </div>
          <Separator />
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme across the application
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast">High Contrast</Label>
                <p className="text-sm text-muted-foreground">
                  Increase color contrast for better visibility
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <Button onClick={handleSaveSettings} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button onClick={handleResetSettings} variant="outline" size="lg">
            <Trash2 className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4 pt-8">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
          </div>
          <Separator className="bg-destructive/20" />
          <div className="p-4 border border-destructive/20 rounded-lg space-y-3">
            <div>
              <h3 className="font-medium">Delete Account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}