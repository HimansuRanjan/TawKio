import { AuthenticatedRequest } from "../../types/express";
import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { catchAsyncErrors } from "../middlewares/catchAsyncError";

export const getConversations = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(new Error("User Not Authenticated!"));
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        participants: true,
        lastMessage: true,
      },
      orderBy: { lastMessageAt: "desc" },
    });

    res.status(200).json({
      success: true,
      conversations,
    });
  }
);

export const createConversation = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { participantIds } = req.body;

    // ✅ Step 0: Validate input
    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Participant IDs are required",
      });
    }

    // ✅ Step 1: Always include sender (logged-in user)
    const allParticipantIds = Array.from(new Set([...participantIds, userId]));

    // ✅ Step 2: Create stable participantHash
    const participantHash = allParticipantIds.sort().join("_");

    // ✅ Step 3: Try to find existing conversation by hash
    let conversation = await prisma.conversation.findUnique({
      where: { participantHash },
      include: { participants: true, messages: true },
    });

    if (conversation) {
      console.log("Conversation already exists", conversation.id);
      return res.status(200).json({
        success: true,
        message: "Conversation already exists",
        conversation,
      });
    }

    // ✅ Step 4: Otherwise create new conversation
    conversation = await prisma.conversation.create({
      data: {
        participantHash,
        isGroup: allParticipantIds.length > 2,
        participants: {
          connect: allParticipantIds.map((id) => ({ id })),
        },
      },
      include: { participants: true, messages: true},
    });

    console.log("Conversation created!", conversation.id);
    return res.status(201).json({
      success: true,
      message: "Conversation created",
      conversation,
    });
  }
);


// export const createConversation = catchAsyncErrors(
//   async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     const userId = req.user?.id;
//     const { participantIds } = req.body;

//     if (
//       !participantIds ||
//       !Array.isArray(participantIds) ||
//       participantIds.length === 0
//     ) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Participant IDs are required" });
//     }

//     // Ensure the authenticated user is included
//     const allParticipantIds = Array.from(new Set([...participantIds, userId]));

//     // Validate that all users exist
//     const users = await prisma.user.findMany({
//       where: {
//         id: { in: allParticipantIds },
//       },
//     });

//     if (users.length !== allParticipantIds.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Some participant IDs are invalid",
//       });
//     }

//     const conversation = await prisma.conversation.create({
//       data: {
//         participants: {
//           connect: participantIds.map((id: string) => ({ id })),
//         },
//         isGroup: participantIds.length > 2,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       conversation,
//     });
//   }
// );

// export const createConversation = catchAsyncErrors(
//   async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     const userId = req.user?.id;
//     const { participantIds } = req.body;

//     // ✅ Step 0: Validate input
//     if (!Array.isArray(participantIds) || participantIds.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Participant IDs are required",
//       });
//     }

//     // ✅ Step 1: Always include sender (logged-in user)
//     const allParticipantIds = Array.from(new Set([...participantIds, userId]));

//     // ✅ Step 2: Find conversation with EXACT same set of users
//     // Uses the hidden join table created by :contentReference[oaicite:0]{index=0} for many-to-many relations
//     const ids = allParticipantIds.map((id) => `'${id}'`).join(",");

//     const existing = await prisma.$queryRawUnsafe<
//       { conversationId: string }[]
//     >(`
//   SELECT "B" AS "conversationId"
//   FROM "_UserConversations"
//   WHERE "A" IN (${ids})
//   GROUP BY "B"
//   HAVING COUNT(DISTINCT "A") = ${allParticipantIds.length}
// `);

//     // ✅ Step 3: Confirm there are no extra participants in that conversation
//     if (existing.length > 0) {
//       const convId = existing[0]!.conversationId;

//       const count = await prisma.user.count({
//         where: {
//           conversations: {
//             some: { id: convId },
//           },
//         },
//       });

//       if (count === allParticipantIds.length) {
//         const conversation = await prisma.conversation.findUnique({
//           where: { id: convId },
//           include: { participants: true },
//         });
//         console.log("Conversation already exists", conversation);
//         return res.status(200).json({
//           success: true,
//           message: "Conversation already exists",
//           conversation,
//         });
//       }
//     }

//     // ✅ Step 4: If no existing conversation, create a new one
//     const conversation = await prisma.conversation.create({
//       data: {
//         participants: {
//           connect: allParticipantIds.map((id) => ({ id })),
//         },
//         isGroup: allParticipantIds.length > 2,
//       },
//       include: {
//         participants: true,
//       },
//     });
//     console.log("Conversation created!", conversation);
//     return res.status(201).json({
//       success: true,
//       message: "Conversation created",
//       conversation,
//     });
//   }
// );
