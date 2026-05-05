import { UserRepository } from '../repositories/user.repository';
import { NotFoundError } from '../utils/errors';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
