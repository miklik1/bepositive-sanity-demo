import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{
      _type: string;
      slug?: { current?: string };
    }>(req, process.env.SANITY_WEBHOOK_SECRET);

    // Validate the webhook signature (optional but recommended)
    if (!isValidSignature && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    if (!body?._type) {
      return NextResponse.json({ message: "Bad Request" }, { status: 400 });
    }

    // Revalidate specific paths based on content type
    switch (body._type) {
      case "post":
        if (body.slug?.current) {
          await revalidatePath(`/posts/${body.slug.current}`);
          console.log(`Revalidated post: /posts/${body.slug.current}`);
        }
        // Also revalidate the home page where posts are listed
        await revalidatePath("/");
        console.log("Revalidated home page");
        break;

      case "page":
        if (body.slug?.current) {
          await revalidatePath(`/${body.slug.current}`);
          console.log(`Revalidated page: /${body.slug.current}`);
        }
        break;

      default:
        // For any other content type, revalidate the home page
        await revalidatePath("/");
        console.log("Revalidated home page for unknown content type");
        break;
    }

    return NextResponse.json({
      message: "Success",
      revalidated: true,
      now: Date.now(),
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
