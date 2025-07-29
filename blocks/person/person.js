export function create(data) {
  const item = document.createElement('div');
  // TODO codegen
  const fields = {
    example_id: data.id,
    firstname: data.firstName,
    surname: data.lastName,
  };
  Object.entries(fields)
    .forEach(([key, value]) => {
      const field = document.createElement('span');
      field.innerText = `${key}: ${typeof value !== 'object' ? value : JSON.stringify(value)}`;
      item.append(field);
    });

  return item;
};

export default function decorate(block) {
};
