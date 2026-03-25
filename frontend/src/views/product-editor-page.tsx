import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProductEditorPage() {
  return (
    <>
      <section className="studio-lead">
        <div className="section-label">Product editor</div>
        <h1>Edit product details before they appear in the public catalog.</h1>
        <p>
          Add the fields your customers need to scan quickly: title, description, price, category, and searchable tags.
        </p>
      </section>

      <section className="editor-columns">
        <div className="product-stage" />
        <form className="editor-form">
          <label className="field">
            <span>Title</span>
            <Input type="text" placeholder="Ridge Chair" />
          </label>
          <label className="field">
            <span>Description</span>
            <Textarea rows={5} placeholder="Describe the product..." />
          </label>
          <label className="field">
            <span>Price</span>
            <Input type="number" placeholder="14999" />
          </label>
          <label className="field">
            <span>Category</span>
            <Input type="text" placeholder="Seating" />
          </label>
          <label className="field">
            <span>Tags</span>
            <Input type="text" placeholder="featured, oak, lounge" />
          </label>
          <div className="form-actions">
            <Button variant="rust" type="submit">
              Save product
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
