import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Check } from "lucide-react";
import { Avatar, fetchAvatars, login, signup } from "@/lib/auth-api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup";
}

export function AuthDialog({ open, onOpenChange, defaultTab = "signup" }: AuthDialogProps) {
  const { setUser } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [pickedAvatarId, setPickedAvatarId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");

  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  useEffect(() => {
    if (!open) return;
    setTab(defaultTab);
    fetchAvatars().then(list => {
      setAvatars(list);
      if (list.length && pickedAvatarId === null) {
        setPickedAvatarId(list[Math.floor(Math.random() * list.length)].id);
      }
    }).catch(() => {});
  }, [open, defaultTab]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedAvatarId) {
      toast.error("Pick an avatar");
      return;
    }
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const { user } = await signup({
        email: signupEmail.trim(),
        password: signupPassword,
        username: signupUsername.trim(),
        avatarId: pickedAvatarId,
      });
      setUser(user);
      toast.success(`Welcome, ${user.username}!`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { user } = await login(signinEmail.trim(), signinPassword);
      setUser(user);
      toast.success(`Welcome back, ${user.username}!`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{tab === "signup" ? "Create account" : "Welcome back"}</DialogTitle>
          <DialogDescription>
            {tab === "signup"
              ? "Sign up to save your scores and appear on the leaderboard."
              : "Sign in to your TypeFlow account."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign up</TabsTrigger>
            <TabsTrigger value="signin">Sign in</TabsTrigger>
          </TabsList>

          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label>Pick an avatar</Label>
                <div className="grid grid-cols-6 gap-2">
                  {avatars.map((a) => {
                    const picked = pickedAvatarId === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setPickedAvatarId(a.id)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          picked ? "border-primary ring-2 ring-primary/30 scale-105" : "border-border hover:border-primary/50"
                        }`}
                        title={a.label}
                      >
                        <img src={a.url} alt={a.label} className="w-full h-full object-cover" />
                        {picked && (
                          <div className="absolute top-0.5 right-0.5 bg-primary text-primary-foreground rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="su-username">Username</Label>
                <Input
                  id="su-username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="speedy_typer"
                  maxLength={20}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="su-email">Email</Label>
                <Input
                  id="su-email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="su-password">Password</Label>
                <Input
                  id="su-password"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                  disabled={submitting}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create account
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signin" className="mt-4">
            <form onSubmit={handleSignin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="si-email">Email</Label>
                <Input
                  id="si-email"
                  type="email"
                  value={signinEmail}
                  onChange={(e) => setSigninEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="si-password">Password</Label>
                <Input
                  id="si-password"
                  type="password"
                  value={signinPassword}
                  onChange={(e) => setSigninPassword(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sign in
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
