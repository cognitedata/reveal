import * as yup from 'yup';

export const ContactsErrorMsg = {
  NAME_REQUIRED: 'Contact name is required',
  EMAIL_REQUIRED: 'Contact email is required',
  EMAIL_INVALID: 'Contact email must be a valid email',
};

export const contactsRule = {
  contacts: yup.array().of(
    yup.object().shape({
      name: yup.string().required(ContactsErrorMsg.NAME_REQUIRED),
      email: yup
        .string()
        .required(ContactsErrorMsg.EMAIL_REQUIRED)
        .email(ContactsErrorMsg.EMAIL_INVALID),
      role: yup.string(),
      sendNotification: yup.boolean(),
    })
  ),
};

export const contactsSchema = yup.object().shape(contactsRule);
