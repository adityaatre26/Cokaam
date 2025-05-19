export default function userPage({ params }) {
  const { id } = params.id;
  return (
    <div>
      <h1>User ID: {id}</h1>
      <p>This is the user page for user with ID: {id}</p>
    </div>
  );
}
