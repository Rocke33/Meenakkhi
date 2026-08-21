import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatBDT } from '../types/database';
import type { Product, ProductComment } from '../types/database';
import { getErrorMessage } from '../utils/errorHandling';
import { useCart } from '../context/CartContext';

interface AdditionalImage {
  id: number;
  product_id: number;
  image_url: string;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshCart, triggerCartAlert } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [itemCount, setItemCount] = useState<number>(1);
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isAddedSuccess, setIsAddedSuccess] = useState<boolean>(false);

  // Gallery & Image Management
  const [additionalImages, setAdditionalImages] = useState<AdditionalImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Admin Verification State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Swipe gesture ref
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Dynamic Comments & Rating
  const [commentsList, setCommentsList] = useState<ProductComment[]>([]);
  const [averageRating, setAverageRating] = useState<number>(5.0);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);

  // User input
  const [userRating, setUserRating] = useState<number>(5);
  const [userText, setUserText] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  // Check if admin is authenticated from local key/session
  useEffect(() => {
    const adminSession = localStorage.getItem('menakkhi_admin_auth');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const fetchAdditionalImages = async (productId: number) => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('id', { ascending: true });

      if (!error && data) {
        setAdditionalImages(data as AdditionalImage[]);
      }
    } catch (err) {
      console.error('Error fetching additional images:', getErrorMessage(err));
    }
  };

  const fetchCommentsAndRatings = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('product_comments')
        .select('id, product_id, user_id, user_email, rating, comment, created_at')
        .eq('product_id', Number(id))
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCommentsList(data as ProductComment[]);
        if (data.length > 0) {
          const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
          setAverageRating(parseFloat((sum / data.length).toFixed(1)));
        } else {
          setAverageRating(5.0);
        }
      }
    } catch (err) {
      console.error('Error reading reviews:', getErrorMessage(err));
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    const fetchSingleItem = async () => {
      setLoading(true);
      setStatusMessage('');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', Number(id))
        .single();

      if (error) {
        console.error('Error fetching product:', error.message);
      } else if (data) {
        setProduct(data as Product);
        await fetchAdditionalImages(data.id);
      }
      setLoading(false);
    };

    if (id) {
      fetchSingleItem();
      fetchCommentsAndRatings();
    }
  }, [id]);

  // Combine Primary + Additional Images (Max 4 Total)
  const allImages = product
    ? [
        { id: -1, isPrimary: true, url: product.image_url },
        ...additionalImages.map((img) => ({ id: img.id, isPrimary: false, url: img.image_url })),
      ]
    : [];

  const handleNextImage = () => {
    if (allImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    if (allImages.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Mobile Touch Handlers for Carousel Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNextImage(); // Swiped Left
    } else if (distance < -50) {
      handlePrevImage(); // Swiped Right
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;

    if (additionalImages.length >= 3) {
      alert('⚠️ Maximum limit reached! A product can have 1 primary image and up to 3 additional images (Total 4).');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('❌ Please select a valid image file (JPEG, PNG, WEBP, etc.).');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `sarees/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage.from('products').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const { data: dbData, error: dbError } = await supabase
        .from('product_images')
        .insert([{ product_id: product.id, image_url: publicUrl }])
        .select();

      if (dbError) throw dbError;

      if (dbData) {
        setAdditionalImages((prev) => [...prev, dbData[0] as AdditionalImage]);
        setCurrentIndex(additionalImages.length + 1); // Focus newly uploaded image
      }
    } catch (err: unknown) {
      alert(`❌ ${getErrorMessage(err)}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Image Delete Handler (Protected against Primary Image)
  const handleDeleteImage = async (imageId: number, imageUrl: string, isPrimary: boolean) => {
    if (isPrimary) {
      alert('🔒 Primary image cannot be deleted.');
      return;
    }

    if (!confirm('Are you sure you want to delete this additional photo?')) return;

    setDeletingImageId(imageId);
    try {
      // Extract storage path from URL if hosted on Supabase Storage
      if (imageUrl.includes('/products/sarees/')) {
        const path = imageUrl.split('/products/')[1];
        if (path) {
          await supabase.storage.from('products').remove([path]);
        }
      }

      const { error } = await supabase.from('product_images').delete().eq('id', imageId);
      if (error) throw error;

      setAdditionalImages((prev) => prev.filter((img) => img.id !== imageId));
      setCurrentIndex(0); // Reset viewer to primary image
    } catch (err: unknown) {
      alert(`❌ Failed to delete image: ${getErrorMessage(err)}`);
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleAddToCart = async () => {
    setCartLoading(true);
    setStatusMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatusMessage('⚠️ Please log in to add sarees to your cart.');
      setCartLoading(false);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', Number(id))
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + itemCount })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cart_items').insert([
          {
            user_id: user.id,
            product_id: product?.id,
            quantity: itemCount,
          },
        ]);
        if (error) throw error;
      }

      triggerCartAlert();
      await refreshCart();
      setIsAddedSuccess(true);
      setTimeout(() => setIsAddedSuccess(false), 3000);
    } catch (err: unknown) {
      setStatusMessage('❌ Error updating cart: ' + getErrorMessage(err));
    } finally {
      setCartLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userText.trim()) return;

    setSubmittingComment(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const chosenDisplayName =
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Valued Customer';

      const commentPayload = {
        product_id: Number(id),
        user_id: user.id,
        user_email: chosenDisplayName,
        rating: userRating,
        comment: userText.trim(),
      };

      const { error } = await supabase
        .from('product_comments')
        .insert([commentPayload]);

      if (error) throw error;

      setUserText('');
      await fetchCommentsAndRatings();
    } catch (err: unknown) {
      alert(getErrorMessage(err) || 'Failed to submit review.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-rose-50/20 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-4 border-rose-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Loading Saree Details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-rose-50/20 font-sans">
        <Navbar />
        <div className="text-center py-20 text-gray-500 font-medium">Saree record could not be found.</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-rose-50/20 font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-6 sm:py-12 space-y-6">
        
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-rose-900 text-white hover:bg-rose-800 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 group"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Back to Collections</span>
          </Link>

          {/* Toggle Admin Toolbar view if logged into Admin */}
          {isAdmin && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 px-3 py-1.5 rounded-xl border border-rose-200">
              👑 Admin Photo Mode Active
            </span>
          )}
        </div>

        {statusMessage && !isAddedSuccess && (
          <div className="p-4 rounded-xl text-xs font-bold bg-white border border-rose-100 shadow-2xs">
            {statusMessage}
          </div>
        )}

        {/* Primary Details Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 bg-white border border-rose-100 p-4 sm:p-8 rounded-3xl shadow-xs">
          
          {/* Swipeable Carousel Container */}
          <div className="flex flex-col gap-3 w-full">
            <div 
              className="relative w-full h-72 sm:h-96 bg-rose-50/30 rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-rose-100 shrink-0 select-none touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {allImages.length > 0 && (
                <img 
                  src={allImages[currentIndex]?.url} 
                  alt={`${product.title} view ${currentIndex + 1}`} 
                  className="max-h-full max-w-full object-contain transition-all duration-300 ease-in-out" 
                />
              )}

              {/* Left/Right Desktop Controls */}
          
{allImages.length > 1 && (
  <>
    <button
  onClick={handlePrevImage}
  className="absolute left-3 top-1/2 -translate-y-1/2
             w-9 h-9 sm:w-10 sm:h-10
             rounded-full
             bg-black text-white
             flex items-center justify-center
             text-2xl sm:text-3xl
             font-bold
             shadow-md
             hover:bg-black/80
             transition-all duration-200
             cursor-pointer z-10"
  aria-label="Previous Image"
>
  ‹
</button>

<button
  onClick={handleNextImage}
  className="absolute right-3 top-1/2 -translate-y-1/2
             w-9 h-9 sm:w-10 sm:h-10
             rounded-full
             bg-black text-white
             flex items-center justify-center
             text-2xl sm:text-3xl
             font-bold
             shadow-md
             hover:bg-black/80
             transition-all duration-200
             cursor-pointer z-10"
  aria-label="Next Image"
>
  ›
</button>
  </>
)}

              {/* Primary Image Badge */}
        

              {/* Delete Icon overlay on current additional photo for Admin */}
              {isAdmin && !allImages[currentIndex]?.isPrimary && (
                <button
                  onClick={() => handleDeleteImage(allImages[currentIndex].id, allImages[currentIndex].url, false)}
                  disabled={deletingImageId === allImages[currentIndex].id}
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl text-xs shadow-lg transition cursor-pointer flex items-center gap-1 font-bold"
                  title="Delete image"
                >
                  {deletingImageId === allImages[currentIndex].id ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>

            {/* Carousel Dots & Thumbnails Navigation */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {allImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                      currentIndex === idx ? 'border-rose-900 scale-105 shadow-xs' : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Admin Image Upload Action */}
              {isAdmin && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {additionalImages.length < 3 ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {uploadingImage ? 'Uploading...' : '＋ Upload Image'}
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200">
                      Max 4 Photos Reached
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Details & Actions */}
          <div className="flex flex-col justify-between min-w-0">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <span className="inline-block bg-rose-100 text-rose-900 font-black text-[9px] sm:text-[10px] tracking-widest uppercase px-3 py-1 rounded-md mb-2">
                  {product.category}
                </span>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-rose-950 leading-tight mb-2">
                  {product.title}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm sm:text-base ${i < Math.round(averageRating) ? 'text-amber-400' : 'text-gray-200'}`}>
                      ★
                    </span>
                  ))}
                  <span className="text-xs text-gray-500 font-semibold ml-2">
                    ({averageRating} · {commentsList.length} customer reviews)
                  </span>
                </div>
              </div>

              {/* Price & Cart Actions */}
              <div className="bg-rose-50/40 border border-rose-100 p-4 sm:p-5 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-rose-100/80 pb-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Price
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-rose-950 font-mono">
                      {formatBDT(product.price)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Availability
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      ✔ In Stock (Ready to Ship)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center w-full">
                  {/* Stepper */}
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs shrink-0 h-11">
                    <button
                      disabled={isAddedSuccess}
                      onClick={() => setItemCount(Math.max(1, itemCount - 1))}
                      className="w-10 h-full flex items-center justify-center font-black text-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border-r border-gray-200 transition disabled:opacity-40 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm font-black text-gray-900 min-w-[36px] text-center font-mono select-none">
                      {itemCount}
                    </span>
                    <button
                      disabled={isAddedSuccess}
                      onClick={() => setItemCount(itemCount + 1)}
                      className="w-10 h-full flex items-center justify-center font-black text-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-l border-gray-200 transition disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add Button */}
                  <div className="flex-1 flex flex-col relative min-w-0 h-11">
                    {isAddedSuccess && (
                      <span className="absolute -top-4 left-0 right-0 text-center text-[9px] font-bold text-emerald-600 animate-pulse">
                        Added to cart!
                      </span>
                    )}
                    <button
                      onClick={handleAddToCart}
                      disabled={cartLoading || isAddedSuccess}
                      className={`w-full h-full text-white font-black uppercase tracking-wider rounded-xl shadow-2xs transition cursor-pointer flex items-center justify-center text-xs px-4 ${
                        isAddedSuccess
                          ? 'bg-emerald-600 cursor-default'
                          : cartLoading
                          ? 'bg-rose-400 cursor-not-allowed'
                          : 'bg-rose-900 hover:bg-rose-800 active:scale-[0.98]'
                      }`}
                    >
                      {isAddedSuccess
                        ? '✓ Added to Cart'
                        : cartLoading
                        ? 'Syncing...'
                        : `Add to Cart (${formatBDT(product.price * itemCount)})`}
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-rose-50 pt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Saree Craft & Specification
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-gray-700">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white border border-rose-100 rounded-3xl p-4 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-serif font-bold text-rose-950 uppercase tracking-tight border-b border-rose-50 pb-2">
            Customer Reviews & Ratings
          </h2>

          <form onSubmit={handleCommentSubmit} className="bg-rose-50/40 border border-rose-100 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider">Write a Review</h3>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className={`text-base sm:text-xl select-none transition ${
                      star <= userRating ? 'text-amber-400 scale-105' : 'text-gray-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Share your feedback regarding saree fabric quality, weave, or color..."
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-rose-500 shadow-2xs"
              />
              <button
                type="submit"
                disabled={submittingComment || !userText.trim()}
                className="bg-rose-900 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider hover:bg-rose-800 transition disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {submittingComment ? 'Posting...' : 'Submit'}
              </button>
            </div>
          </form>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {loadingComments ? (
              <p className="text-center text-xs text-gray-400 font-bold animate-pulse py-4">Loading customer reviews...</p>
            ) : commentsList.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-rose-100 rounded-2xl bg-rose-50/20">
                <p className="text-xs text-gray-400 font-medium">No reviews submitted yet. Be the first to review this saree!</p>
              </div>
            ) : (
              commentsList.map((record) => (
                <div
                  key={record.id}
                  className="bg-white border border-rose-100 p-3.5 rounded-2xl shadow-2xs flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                    <span className="text-rose-950 truncate">{record.user_email}</span>
                    <span className="text-amber-400 text-xs">
                      {'★'.repeat(record.rating)}
                      {'☆'.repeat(5 - record.rating)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 leading-normal break-words">
                    {record.comment}
                  </p>
                  <span className="text-[9px] text-gray-400 font-mono self-end">
                    {new Date(record.created_at).toLocaleDateString('en-BD', { dateStyle: 'medium' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}