import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SignupPage() {
  return (
    <main className="auth-scene auth-scene--signup">
      <section className="auth-copy">
        <div className="section-label">Start your catalog</div>
        <h1>Create a store catalog your team can update and your customers can open anywhere.</h1>
        <p>
          Claim your company link, upload products, and turn your inventory into a shareable catalog built for WhatsApp, email, and the web.
        </p>
      </section>

      <Card className="auth-form">
        <CardContent className="p-8">
          <div className="section-label">Create workspace</div>
          <h1>Sign up</h1>
          <p>Your company slug becomes the public catalog URL customers will visit.</p>
          <form className="auth-form-grid">
          <label className="field">
            <span>Name</span>
            <Input type="text" placeholder="Jane Smith" />
          </label>
          <label className="field">
            <span>Company name</span>
            <Input type="text" placeholder="Northwind Supply" />
          </label>
          <label className="field">
            <span>Company slug</span>
            <Input type="text" placeholder="northwind-supply" />
          </label>
          <label className="field">
            <span>Email</span>
            <Input type="email" placeholder="owner@northwind.com" />
          </label>
          <label className="field">
            <span>Password</span>
            <Input type="password" placeholder="Create a password" />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <Input type="password" placeholder="Confirm your password" />
          </label>
          <div className="form-actions">
            <Button variant="rust" type="submit">
              Create account
            </Button>
          </div>
        </form>
        <p className="form-note">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
        </CardContent>
      </Card>
    </main>
  );
}
