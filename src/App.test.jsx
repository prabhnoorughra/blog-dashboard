import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import routes from "../src/routes";
import App from './App.jsx'

beforeEach(() => {
  vi.restoreAllMocks(); // reset mocks between tests
});

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn()
}));

const samplePosts = [{id: 1, title: "Sample Post", _count: {PostLikes: 0, comments: 0},
                createdAt: Date.now(), updatedAt: Date.now(), content: "<div>Hi</div>", published: false},
            ];
const sampleComments = [{id: 1,  _count: {CommentLikes: 0, replies: 0}, creator: {username: "sampleuser"},
                createdAt: Date.now(), content: "Sample Comment"},
            ];
const sampleComments2 = [{id: 2,  _count: {CommentLikes: 0, replies: 1}, creator: {username: "sampleuser"},
    createdAt: Date.now(), content: "Sample Comment"},
];
const samplePagination =  {page: 1, totalPages: 1, total: samplePosts.length};

//mock jwtDecode per test for specific cases
import { jwtDecode } from "jwt-decode"; 

function renderAt(path) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return <RouterProvider router={router} />;
}

describe('Home Page not logged in', () => {
    it("renders correct page", () => {
        render(renderAt("/"));
        expect(screen.getByText(/Blog Manager/i)).toBeInTheDocument();
        expect(screen.getByText(/Please Log In/i)).toBeInTheDocument();
        expect((screen.getByRole("button").textContent)).toMatch(/Log In/i);
    });
});

describe('Login Page not logged in', () => {
    it("renders correct page", () => {
        render(renderAt("/login"));
        expect(screen.getByText(/Blog Manager/i)).toBeInTheDocument();
        expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
        expect((screen.getByRole("button").textContent)).toMatch(/Log In/i);
        expect((screen.getByRole("link").textContent)).toMatch(/Sign Up Here/i);
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });
});

describe('Error when logging in', () => {
    it("shows error when login fails", async () => {
        vi.spyOn(window, "fetch").mockResolvedValueOnce(
                new Response(JSON.stringify({ message: "Invalid credentials" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            })
        );

        render(renderAt("/login"));

        await userEvent.type(screen.getByLabelText(/Email/i), "bad@example.com");
        await userEvent.type(screen.getByLabelText(/Password/i), "wrongpass");
        await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

        expect(await screen.findByText(/Incorrect Username or Password/i)).toBeInTheDocument();
    });
})

describe('Signup Page not logged in', () => {
    it("renders correct page", () => {
        render(renderAt("/sign-up"));
        expect(screen.getByText(/Blog Manager/i)).toBeInTheDocument();
        expect((screen.getByRole("button").textContent)).toMatch(/Sign Up/i);
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });
});

describe('Error when signing up', () => {
    it("shows errors when signup fails", async () => {
        vi.spyOn(window, "fetch").mockResolvedValueOnce(
                new Response(JSON.stringify({ errors:[{msg: "Invalid username"},{msg: "Invalid password"} ]}), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            })
        );

        render(renderAt("/sign-up"));

        await userEvent.type(screen.getByLabelText(/Email/i), "good@example.com");
        await userEvent.type(screen.getByLabelText("Password"), "rightpass");
        await userEvent.type(screen.getByLabelText("Confirm Password"), "wrongpass");
        await userEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

        expect(await screen.findByText("Passwords Don't Match!")).toBeInTheDocument();

        await userEvent.clear(screen.getByLabelText(/Email/i), "good@example.com");
        await userEvent.clear(screen.getByLabelText("Password"), "rightpass");
        await userEvent.clear(screen.getByLabelText("Confirm Password"), "wrongpass");

        await userEvent.type(screen.getByLabelText(/Email/i), "good@example.com");
        await userEvent.type(screen.getByLabelText("Password"), "wrongpass");
        await userEvent.type(screen.getByLabelText("Confirm Password"), "wrongpass");
        await userEvent.click(screen.getByRole("button", { name: /Sign Up/i }));
        expect(await screen.findByText("Invalid username")).toBeInTheDocument();
        expect(await screen.findByText("Invalid password")).toBeInTheDocument();
    });
})

describe('Successful logins', () => {
  it("log in successfully as USER and log out", async () => {
    vi.mocked(jwtDecode).mockReturnValue({
        id: "u1",
        exp: Date.now() / 1000 + 36000,
        role: "USER",
        username: "testuser"
    });
    
    vi.spyOn(window, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ token: "fake.jwt.token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    render(renderAt("/login"));

    await userEvent.type(screen.getByLabelText(/Email/i), "good@example.com");
    await userEvent.type(screen.getByLabelText(/Password/i), "correctpass");
    await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
        expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
        expect(screen.getByText(/Become an Author Today/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /Log Out/i }));

    await waitFor(() => {
        expect(screen.getByRole("button").textContent).toMatch(/Log In/i);
        expect(screen.getByText("Please Log In!")).toBeInTheDocument();
    });
  });

  it("log in successfully as AUTHOR with no posts and log out", async () => {
    vi.mocked(jwtDecode).mockReturnValue({
        id: "u1",
        exp: Date.now() / 1000 + 36000,
        role: "AUTHOR",
        username: "testuser"
    });
    
    vi.spyOn(window, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ token: "fake.jwt.token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    render(renderAt("/login"));

    await userEvent.type(screen.getByLabelText(/Email/i), "good@example.com");
    await userEvent.type(screen.getByLabelText(/Password/i), "correctpass");
    await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
        expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
        expect(screen.getByText(/New Post/i)).toBeInTheDocument();
        expect(screen.getByText(/No Posts/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /Log Out/i }));

    await waitFor(() => {
        expect(screen.getByRole("button").textContent).toMatch(/Log In/i);
        expect(screen.getByText("Please Log In!")).toBeInTheDocument();
    });
  });

  it("log in successfully as AUTHOR with some posts and log out", async () => {
    vi.mocked(jwtDecode).mockReturnValue({
        id: "u1",
        exp: Date.now() / 1000 + 36000,
        role: "AUTHOR",
        username: "testuser"
    });
    
    vi.spyOn(window, "fetch")
        .mockResolvedValueOnce(
            new Response(JSON.stringify({ token: "fake.jwt.token" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
            new Response(JSON.stringify({ posts: [{id: 1, title: "Sample Post", _count: {PostLikes: 0, comments: 0},
                createdAt: Date.now(), updatedAt: Date.now(), content: "<div>Hi</div>", published: false},] ,
                pagination: {page: 1, totalPages: 1, total: 1}}), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        );


    render(renderAt("/login"));

    await userEvent.type(screen.getByLabelText(/Email/i), "good@example.com");
    await userEvent.type(screen.getByLabelText(/Password/i), "correctpass");
    await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
        expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
        expect(screen.getByText(/New Post/i)).toBeInTheDocument();
        expect(screen.getByText(/Sample Post/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /Log Out/i }));

    await waitFor(() => {
        expect(screen.getByRole("button").textContent).toMatch(/Log In/i);
        expect(screen.getByText("Please Log In!")).toBeInTheDocument();
    });
  });
  
});


describe('Unknown Path', () => {
    it('unknown path → ErrorPage', () => {
        render(renderAt("/random"));
        expect(screen.getByText(/Error Encountered: Invalid Path/i)).toBeInTheDocument();
        expect((screen.getByRole("link").textContent)).toMatch(/Click to Go Back to the Home Page/i);
  });
});

describe('Server Errors', () => {
    it("shows server error when logged in and 500 status returns from server", async () => {
        vi.mocked(jwtDecode).mockReturnValue({
            id: "u1",
            exp: Date.now() / 1000 + 36000,
            role: "AUTHOR",
            username: "testuser"
        });
        vi.spyOn(window, "fetch")
        .mockResolvedValueOnce(
            new Response(JSON.stringify({ token: "fake.jwt.token" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
                new Response(JSON.stringify({ message: "Error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            })
        );

        render(renderAt("/login"));

        await userEvent.type(screen.getByLabelText(/Email/i), "good@example.com");
        await userEvent.type(screen.getByLabelText(/Password/i), "rightpass");
        await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

        expect(await screen.findByText(/Error:/i)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /Log Out/i }));
    });
    it("shows server error when logged in and posts load but comments dont", async () => {
        vi.mocked(jwtDecode).mockReturnValue({
            id: "u1",
            exp: Date.now() / 1000 + 36000,
            role: "AUTHOR",
            username: "testuser"
        });
        vi.spyOn(window, "fetch")
        .mockResolvedValueOnce(
            new Response(JSON.stringify({ token: "fake.jwt.token" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
            new Response(JSON.stringify({posts: samplePosts, pagination: samplePagination}), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
                new Response(JSON.stringify({ message: "Error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            })
        );

        render(renderAt("/login"));

        await userEvent.type(screen.getByLabelText(/Email/i), "good@example.com");
        await userEvent.type(screen.getByLabelText(/Password/i), "rightpass");
        await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

        expect(await screen.findByText(/Sample Post/i)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /Comments/i }));
        expect(await screen.findByText(/Error:/i)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /Log Out/i }));
    });
})

describe('Post Forms', () => {
    it("shows new post form", async () => {
        vi.mocked(jwtDecode).mockReturnValue({
            id: "u1",
            exp: Date.now() / 1000 + 36000,
            role: "AUTHOR",
            username: "testuser"
        });
        vi.spyOn(window, "fetch")
        .mockResolvedValueOnce(
            new Response(JSON.stringify({ token: "fake.jwt.token" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
                new Response(JSON.stringify({ posts: [], pagination: {total: 0, totalPages: 1, page: 1} }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        );

        render(renderAt("/login"));

        await userEvent.type(screen.getByLabelText(/Email/i), "good@example.com");
        await userEvent.type(screen.getByLabelText(/Password/i), "rightpass");
        await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

        expect(await screen.findByText("No Posts")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: /New Post/i }));
        expect(await screen.findByLabelText(/Title/i)).toBeInTheDocument();
        expect(await screen.findByText(/Create Post/i)).toBeInTheDocument();
        expect(await screen.findByText(/Cancel/i)).toBeInTheDocument();


        await userEvent.click(screen.getByRole("button", { name: /Cancel/i }));
        expect(await screen.findByText(/Log Out/i)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /Log Out/i }));
    });
    it("edit post form works", async () => {
        vi.mocked(jwtDecode).mockReturnValue({
            id: "u1",
            exp: Date.now() / 1000 + 36000,
            role: "AUTHOR",
            username: "testuser"
        });
        vi.spyOn(window, "fetch")
        .mockResolvedValueOnce(
            new Response(JSON.stringify({ token: "fake.jwt.token" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
                new Response(JSON.stringify({ posts: samplePosts, pagination: samplePagination }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
                new Response(JSON.stringify(samplePosts[0]), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        );


        render(renderAt("/login"));

        await userEvent.type(screen.getByLabelText(/Email/i), "good@example.com");
        await userEvent.type(screen.getByLabelText(/Password/i), "rightpass");
        await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

        expect(await screen.findByText("Sample Post")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: /Edit/i }));
        expect(await screen.findByLabelText(/Title/i)).toBeInTheDocument();
        expect(await screen.findByLabelText(/Published/i)).toBeInTheDocument();
        expect(await screen.findByText(/Save/i)).toBeInTheDocument();
        expect(await screen.findByText(/Cancel/i)).toBeInTheDocument();


        await userEvent.click(screen.getByRole("button", { name: /Cancel/i }));
        expect(await screen.findByText(/Log Out/i)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /Log Out/i }));
    });
})



describe('Comment Testing', () => {
    it("successful login with a post and empty comments", async () => {
        vi.mocked(jwtDecode).mockReturnValue({
            id: "u1",
            exp: Date.now() / 1000 + 36000,
            role: "AUTHOR",
            username: "testuser"
        });
        vi.spyOn(window, "fetch")
        .mockResolvedValueOnce(
            new Response(JSON.stringify({ token: "fake.jwt.token" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
            new Response(JSON.stringify({posts: samplePosts, pagination: samplePagination}), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
                new Response(JSON.stringify({ comments: [], pagination: {totalPages: 0, page: 0, total: 0} }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
                new Response(JSON.stringify({ comments: [], pagination: {totalPages: 0, page: 0, total: 0} }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        );

        render(renderAt("/login"));

        await userEvent.type(screen.getByLabelText(/Email/i), "good@example.com");
        await userEvent.type(screen.getByLabelText(/Password/i), "rightpass");
        await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

        expect(await screen.findByText(/Sample Post/i)).toBeInTheDocument();
        const buttons = screen.getAllByRole('button', { name: /comments/i });
        expect(buttons.length).toBeGreaterThan(0);
        await userEvent.click(screen.getByRole("button", { name: /Comments/i }));


        expect(await screen.findByText(/No Comments/i)).toBeInTheDocument();
        expect(await screen.findByText(/Log Out/i)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /Log Out/i }));
    });
    it("successful login with a post and some comments, no replies", async () => {
        vi.mocked(jwtDecode).mockReturnValue({
            id: "u1",
            exp: Date.now() / 1000 + 36000,
            role: "AUTHOR",
            username: "testuser"
        });
        vi.spyOn(window, "fetch")
        .mockResolvedValueOnce(
            new Response(JSON.stringify({ token: "fake.jwt.token" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
            new Response(JSON.stringify({posts: samplePosts, pagination: samplePagination}), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
                new Response(JSON.stringify({ comments: sampleComments, pagination: samplePagination }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        );

        render(renderAt("/login"));

        await userEvent.type(screen.getByLabelText(/Email/i), "good@example.com");
        await userEvent.type(screen.getByLabelText(/Password/i), "rightpass");
        await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

        expect(await screen.findByText(/Sample Post/i)).toBeInTheDocument();
        const buttons = screen.getAllByRole('button', { name: /comments/i });
        expect(buttons.length).toBeGreaterThan(0);
        await userEvent.click(screen.getByRole("button", { name: /Comments/i }));


        expect(await screen.findByText(/Sample Comment/i)).toBeInTheDocument();

        expect(await screen.findByText(/Log Out/i)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /Log Out/i }));
    });
    it("successful login with a post and some comments, some replies", async () => {
        vi.mocked(jwtDecode).mockReturnValue({
            id: "u1",
            exp: Date.now() / 1000 + 36000,
            role: "AUTHOR",
            username: "testuser"
        });
        vi.spyOn(window, "fetch")
        .mockResolvedValueOnce(
            new Response(JSON.stringify({ token: "fake.jwt.token" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
            new Response(JSON.stringify({posts: samplePosts, pagination: samplePagination}), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
                new Response(JSON.stringify({ comments: sampleComments2, pagination: samplePagination }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        )
        .mockResolvedValueOnce(
                new Response(JSON.stringify({ comments: sampleComments, pagination: samplePagination }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        );

        render(renderAt("/login"));

        await userEvent.type(screen.getByLabelText(/Email/i), "good@example.com");
        await userEvent.type(screen.getByLabelText(/Password/i), "rightpass");
        await userEvent.click(screen.getByRole("button", { name: /Log In/i }));

        expect(await screen.findByText(/Sample Post/i)).toBeInTheDocument();
        const buttons = screen.getAllByRole('button', { name: /comments/i });
        expect(buttons.length).toBeGreaterThan(0);
        await userEvent.click(screen.getByRole("button", { name: /Comments/i }));


        expect(await screen.findByText(/Sample Comment/i)).toBeInTheDocument();

        const buttons2 = screen.getAllByRole('button', { name: /replies/i });
        expect(buttons2.length).toBeGreaterThan(0);

        await userEvent.click(screen.getByRole("button", { name: /Replies/i }));
        expect(await screen.findByText(/Sample Comment/i)).toBeInTheDocument();

        expect(await screen.findByText(/Log Out/i)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /Log Out/i }));
    });
})