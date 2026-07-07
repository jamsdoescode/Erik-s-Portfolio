import { compileMdx } from "@/lib/content";

type MdxContentProps = {
  source: string;
};

export async function MdxContent({ source }: MdxContentProps) {
  const Content = await compileMdx(source);

  return (
    <div className="prose-gallery">
      <Content />
    </div>
  );
}
