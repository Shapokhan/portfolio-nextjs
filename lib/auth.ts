import NextAuth from "next-auth";

// Only import your NextAuth config — without DB stuff
export const {
  auth,
} = NextAuth({
  session: { strategy: "jwt" },
  providers: [], // leave empty (providers only needed in route.ts)
});
