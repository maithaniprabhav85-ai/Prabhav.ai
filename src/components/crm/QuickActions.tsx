import { Phone, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrm } from "@/lib/crm/context";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function QuickActions({ leadId, company }: { leadId: string; company: string }) {
  const { logQuickAction } = useCrm();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const handleAction = (type: "call_logged" | "email_logged", msg: string) => {
    logQuickAction(leadId, type, msg);
    toast.success(msg);
  };

  const saveNote = () => {
    if (!note.trim()) return;
    logQuickAction(leadId, "note_logged", `Added note: ${note}`);
    toast.success("Note saved");
    setNote("");
    setNoteOpen(false);
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => handleAction("call_logged", `Logged call with ${company}`)}>
        <Phone className="mr-2 h-4 w-4" /> Call
      </Button>
      <Button size="sm" variant="outline" onClick={() => handleAction("email_logged", `Sent email to ${company}`)}>
        <Mail className="mr-2 h-4 w-4" /> Email
      </Button>
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <FileText className="mr-2 h-4 w-4" /> Note
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note for {company}</DialogTitle>
          </DialogHeader>
          <Textarea 
            placeholder="Type your note here..." 
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={saveNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
