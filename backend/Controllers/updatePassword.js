import bcrypt from 'bcrypt';
import { User } from '../Models/User.js';


export const updatePassword = async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'User ID and password are required' });
  }

  try {

    const hashedPassword = await bcrypt.hash(password, 10); 

    const user = await User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).send();
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).send('An error occurred while updating the password');
  }
};