import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Onayla",
  cancelText = "İptal",
  destructive = false
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            {destructive && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant={destructive ? "destructive" : "default"} 
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}