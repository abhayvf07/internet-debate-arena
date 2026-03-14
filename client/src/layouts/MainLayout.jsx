import Navbar from '../components/Navbar';

export default function MainLayout({ children }) {
    return (
        <>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 60px)' }}>
                {children}
            </main>
        </>
    );
}
