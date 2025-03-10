"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { BackupRestore } from "@/components/settings/backup-restore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Settings className="h-6 w-6 mr-2" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        
        <div className="grid gap-6">
          <BackupRestore />
          
          <Card>
            <CardHeader>
              <CardTitle>About Inspo Library</CardTitle>
              <CardDescription>
                Information about this application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Data Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is stored locally on your computer in the <code className="bg-muted px-1 py-0.5 rounded">data/</code> directory.
                  This directory is excluded from Git, so your personal data won't be committed to the repository.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  This application doesn't send any data to external servers. All your bookmarks, media, and comments
                  are stored locally on your device.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Backup Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  We recommend creating regular backups of your data using the backup feature above.
                  Store these backups in a safe location, such as a cloud storage service or external drive.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 