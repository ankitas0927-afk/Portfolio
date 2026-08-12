import { createHash } from 'crypto';

import { AppError } from '../errors/app-error';
import { ContactMessageModel } from '../models/index';
import { createAuditLog } from './audit.service';

function toCsvValue(value: string | null | undefined) {
  const normalized = value ?? '';
  return `"${normalized.replace(/"/g, '""')}"`;
}

export async function createContactMessage(input: {
  fullName: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  phone?: string;
  ipAddress: string;
  userAgent: string;
}) {
  const message = await ContactMessageModel.create({
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    company: input.company,
    subject: input.subject,
    message: input.message,
    phone: input.phone,
    userAgent: input.userAgent,
    ipHash: createHash('sha256').update(input.ipAddress).digest('hex'),
  });

  return {
    id: message._id.toString(),
    status: message.status,
    createdAt: message.createdAt,
  };
}

export async function listContactMessages(query: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) {
  const filter: Record<string, unknown> = {};
  if (query.status) {
    filter.status = query.status;
  }
  if (query.search) {
    filter.$or = [
      { fullName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { subject: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [totalItems, items] = await Promise.all([
    ContactMessageModel.countDocuments(filter),
    ContactMessageModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
  ]);

  return {
    items: items.map((item) => ({
      id: String(item._id),
      fullName: item.fullName,
      email: item.email,
      company: item.company,
      subject: item.subject,
      messagePreview: `${item.message.slice(0, 120)}${item.message.length > 120 ? '…' : ''}`,
      status: item.status,
      createdAt: item.createdAt,
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / query.limit),
    },
  };
}

export async function getContactMessageById(messageId: string) {
  const message = await ContactMessageModel.findById(messageId).lean();
  if (!message) {
    throw new AppError(404, 'Contact message not found', 'CONTACT_MESSAGE_NOT_FOUND');
  }
  return {
    ...message,
    id: String(message._id),
  };
}

export async function updateContactMessageStatus(
  messageId: string,
  status: 'unread' | 'read' | 'replied' | 'archived',
  adminId: string,
  requestId: string,
) {
  const message = await ContactMessageModel.findByIdAndUpdate(
    messageId,
    { $set: { status } },
    { new: true },
  ).lean();

  if (!message) {
    throw new AppError(404, 'Contact message not found', 'CONTACT_MESSAGE_NOT_FOUND');
  }

  await createAuditLog({
    adminId,
    action: 'update_contact_message',
    resourceType: 'contact-message',
    resourceId: messageId,
    requestId,
    metadata: { status },
  });

  return {
    ...message,
    id: String(message._id),
  };
}

export async function deleteContactMessage(messageId: string, adminId: string, requestId: string) {
  const deleted = await ContactMessageModel.findByIdAndDelete(messageId).lean();
  if (!deleted) {
    throw new AppError(404, 'Contact message not found', 'CONTACT_MESSAGE_NOT_FOUND');
  }

  await createAuditLog({
    adminId,
    action: 'delete_contact_message',
    resourceType: 'contact-message',
    resourceId: messageId,
    requestId,
  });
}

export async function exportContactMessagesAsCsv(query: { status?: string }) {
  const filter: Record<string, unknown> = {};
  if (query.status) {
    filter.status = query.status;
  }

  const messages = await ContactMessageModel.find(filter).sort({ createdAt: -1 }).lean();
  const header = ['Full Name', 'Email', 'Company', 'Phone', 'Subject', 'Status', 'Created At'];
  const rows = messages.map((message) =>
    [
      message.fullName,
      message.email,
      message.company ?? '',
      message.phone ?? '',
      message.subject,
      message.status,
      message.createdAt?.toISOString() ?? '',
    ]
      .map((value) => toCsvValue(String(value)))
      .join(','),
  );

  return [header.map(toCsvValue).join(','), ...rows].join('\n');
}
