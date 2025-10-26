import React, { useState, useEffect, useContext } from 'react';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, onSnapshot, collection } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext.jsx'; // Assuming this path
import { Users, UserPlus, X } from 'lucide-react';

const FriendsList = () => {
  const { currentUser } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [friendUserId, setFriendUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = getFirestore();

  // Get the current user's profile doc path
  const userProfileRef = doc(db, 'userProfiles', currentUser.uid);

  // Listen for real-time updates to the user's friend list
  useEffect(() => {
    if (!currentUser) return;
    
    setIsLoading(true);
    const unsubscribe = onSnapshot(userProfileRef, async (docSnap) => {
      if (docSnap.exists()) {
        const friendIds = docSnap.data().friends || [];
        
        // Now, fetch the profile data for each friend
        if (friendIds.length > 0) {
          const friendProfiles = await Promise.all(
            friendIds.map(async (id) => {
              const friendDoc = await getDoc(doc(db, 'userProfiles', id));
              return friendDoc.exists() ? { id, ...friendDoc.data() } : { id, displayName: 'Unknown User' };
            })
          );
          setFriends(friendProfiles);
        } else {
          setFriends([]);
        }
      } else {
        // Handle case where user profile doesn't exist yet
        console.log("No user profile found, creating one.");
        // You might want to create a profile doc here
      }
      setIsLoading(false);
    }, (err) => {
      console.error(err);
      setError("Failed to load friends.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, db]);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendUserId || friendUserId === currentUser.uid) {
      setError("Invalid User ID.");
      return;
    }
    setError(null);

    try {
      // Check if friend exists before adding
      const friendDoc = await getDoc(doc(db, 'userProfiles', friendUserId));
      if (!friendDoc.exists()) {
        setError("User does not exist.");
        return;
      }

      // Add friend ID to current user's 'friends' array
      await updateDoc(userProfileRef, {
        friends: arrayUnion(friendUserId)
      });
      
      setFriendUserId(''); // Clear input
    } catch (err) {
      console.error("Error adding friend:", err);
      setError("Failed to add friend. Make sure you have a 'userProfiles' collection.");
    }
  };

  return (
    <div className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Users className="mr-2" />
        Friend Circle
      </h3>
      
      {/* Add Friend Form */}
      <form onSubmit={handleAddFriend} className="flex gap-2 mb-4">
        <input
          type="text"
          value={friendUserId}
          onChange={(e) => setFriendUserId(e.target.value)}
          placeholder="Enter Friend's User ID"
          className="flex-grow p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          <UserPlus />
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {/* Friends List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {isLoading && <p className="text-gray-600">Loading friends...</p>}
        {!isLoading && friends.length === 0 && <p className="text-gray-600">Add friends to see their progress!</p>}
        {friends.map(friend => (
          <div key={friend.id} className="bg-white/50 p-3 rounded-lg flex justify-between items-center shadow-sm">
            <span className="font-medium text-gray-800">{friend.displayName || 'Friend'}</span>
            <span className="text-xs text-green-600 font-semibold">
              {friend.streak || 0} Day Streak
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
