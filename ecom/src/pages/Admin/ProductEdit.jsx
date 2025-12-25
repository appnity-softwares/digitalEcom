import { useProduct, useUpdateProduct } from '../../hooks/useQueries';

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const { data: productData, isLoading, isError } = useProduct(id);
    const updateProductMutation = useUpdateProduct();

    useEffect(() => {
        if (productData) {
            const product = productData.product || productData;
            setTitle(product.title || '');
            setPrice(product.price || '');
            setImage(product.image || '');
            setCategory(product.category || '');
            setDescription(product.description || '');
        }
    }, [productData]);

    const submitHandler = async (e) => {
        e.preventDefault();
        updateProductMutation.mutate({
            id,
            productData: { title, price, image, category, description }
        }, {
            onSuccess: () => {
                navigate('/admin/dashboard');
            },
            onError: (error) => {
                alert(error.message);
            }
        });
    };

    if (isLoading) return <div className="p-20 text-center">Loading...</div>;
    if (isError) return <div className="p-20 text-center text-red-500 font-bold">Error loading product</div>;

    return (
        <div className="min-h-screen bg-[#F5F5F7] px-6 py-20 font-sans">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-sm">
                <Link to="/admin/dashboard" className="text-gray-500 text-sm mb-6 inline-block hover:text-black">← Back to Dashboard</Link>
                <h1 className="text-3xl font-black text-black mb-8">Edit Product</h1>

                <form onSubmit={submitHandler} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                        <input className="w-full border p-3 rounded-xl bg-gray-50 text-black font-medium" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Price</label>
                        <input className="w-full border p-3 rounded-xl bg-gray-50 text-black font-medium" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                        <input className="w-full border p-3 rounded-xl bg-gray-50 text-black font-medium" value={image} onChange={(e) => setImage(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                        <input className="w-full border p-3 rounded-xl bg-gray-50 text-black font-medium" value={category} onChange={(e) => setCategory(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea className="w-full border p-3 rounded-xl bg-gray-50 h-32 text-black font-medium" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <button
                        type="submit"
                        disabled={updateProductMutation.isPending}
                        className="bg-[#0055FF] text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductEdit;
