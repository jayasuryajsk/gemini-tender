import { pgTable, foreignKey, uuid, varchar, json, timestamp, unique, text, index, boolean, primaryKey } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"




export const messages = pgTable("messages", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	chatId: uuid("chat_id").notNull(),
	role: varchar().notNull(),
	content: json().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		messagesChatIdFkey: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chats.id],
			name: "messages_chat_id_fkey"
		}),
	}
});

export const votes = pgTable("votes", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	messageId: uuid("message_id").notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		votesMessageIdFkey: foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.id],
			name: "votes_message_id_fkey"
		}),
		votesUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "votes_user_id_fkey"
		}),
	}
});

export const users = pgTable("users", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	email: varchar({ length: 64 }).notNull(),
	password: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		usersEmailKey: unique("users_email_key").on(table.email),
	}
});

export const chats = pgTable("chats", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	title: text().notNull(),
	userId: uuid("user_id").notNull(),
	visibility: varchar().default('private').notNull(),
},
(table) => {
	return {
		chatsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "chats_user_id_fkey"
		}),
	}
});

export const user = pgTable("User", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 64 }).notNull(),
	password: varchar({ length: 64 }),
},
(table) => {
	return {
		userEmailIdx: index("user_email_idx").using("btree", table.email.asc().nullsLast()),
		userEmailUnique: unique("User_email_unique").on(table.email),
	}
});

export const chat = pgTable("Chat", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	title: text().notNull(),
	userId: uuid().notNull(),
	visibility: varchar().default('private').notNull(),
},
(table) => {
	return {
		chatCreatedAtIdx: index("chat_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
		chatUserIdIdx: index("chat_user_id_idx").using("btree", table.userId.asc().nullsLast()),
		chatUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Chat_userId_User_id_fk"
		}).onDelete("cascade"),
	}
});

export const message = pgTable("Message", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	role: varchar().notNull(),
	content: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		messageChatIdIdx: index("message_chat_id_idx").using("btree", table.chatId.asc().nullsLast()),
		messageCreatedAtIdx: index("message_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
		messageChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Message_chatId_Chat_id_fk"
		}).onDelete("cascade"),
	}
});

export const suggestion = pgTable("Suggestion", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	documentId: uuid().notNull(),
	documentCreatedAt: timestamp({ mode: 'string' }).notNull(),
	originalText: text().notNull(),
	suggestedText: text().notNull(),
	description: text(),
	isResolved: boolean().default(false).notNull(),
	userId: uuid().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		suggestionCreatedAtIdx: index("suggestion_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
		suggestionDocumentIdIdx: index("suggestion_document_id_idx").using("btree", table.documentId.asc().nullsLast()),
		suggestionUserIdIdx: index("suggestion_user_id_idx").using("btree", table.userId.asc().nullsLast()),
		suggestionUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Suggestion_userId_User_id_fk"
		}).onDelete("cascade"),
		suggestionDocumentIdDocumentCreatedAtDocumentIdCreatedAtF: foreignKey({
			columns: [table.documentId, table.documentCreatedAt],
			foreignColumns: [document.id, document.createdAt],
			name: "Suggestion_documentId_documentCreatedAt_Document_id_createdAt_f"
		}).onDelete("cascade"),
	}
});

export const file = pgTable("File", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	type: varchar({ length: 255 }).notNull(),
	url: text().notNull(),
	userId: uuid().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		fileUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "File_userId_User_id_fk"
		}),
	}
});

export const vote = pgTable("Vote", {
	chatId: uuid().notNull(),
	messageId: uuid().notNull(),
	isUpvoted: boolean().notNull(),
},
(table) => {
	return {
		voteMessageIdIdx: index("vote_message_id_idx").using("btree", table.messageId.asc().nullsLast()),
		voteChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Vote_chatId_Chat_id_fk"
		}).onDelete("cascade"),
		voteMessageIdMessageIdFk: foreignKey({
			columns: [table.messageId],
			foreignColumns: [message.id],
			name: "Vote_messageId_Message_id_fk"
		}).onDelete("cascade"),
		voteChatIdMessageIdPk: primaryKey({ columns: [table.chatId, table.messageId], name: "Vote_chatId_messageId_pk"}),
	}
});

export const document = pgTable("Document", {
	id: uuid().defaultRandom().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	title: text().notNull(),
	content: text(),
	userId: uuid().notNull(),
	kind: varchar().default('text').notNull(),
},
(table) => {
	return {
		documentCreatedAtIdx: index("document_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
		documentUserIdIdx: index("document_user_id_idx").using("btree", table.userId.asc().nullsLast()),
		documentUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Document_userId_User_id_fk"
		}).onDelete("cascade"),
		documentIdCreatedAtPk: primaryKey({ columns: [table.id, table.createdAt], name: "Document_id_createdAt_pk"}),
	}
});