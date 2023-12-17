import { AbstractDoucment } from './abstract.schema';
import { Model, Types, FilterQuery, UpdateQuery } from 'mongoose';
import { Logger, NotFoundException } from '@nestjs/common';
export abstract class AbstractRepository<TDocument extends AbstractDoucment> {
  protected abstract readonly logger: Logger;
  constructor(protected readonly model: Model<TDocument>) {}

  async create(doucment: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createDocument = new this.model({
      ...doucment,
      _id: new Types.ObjectId(),
    });
    return (await createDocument.save()).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const doucment = await this.model
      .findOne(filterQuery)
      .lean<TDocument>(true);

    if (!doucment) {
      this.logger.warn(
        '[Doucment was not found with filterQuery]',
        filterQuery,
      );
      throw new NotFoundException('Doucment was not found');
    }
    return doucment;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const doucment = await this.model
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean<TDocument>(true);
    if (!doucment) {
      this.logger.warn(
        '[Doucment was not found with filterQuery]',
        filterQuery,
      );
      throw new NotFoundException('Doucment was not found');
    }
    return doucment;
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    return this.model.find(filterQuery).lean<TDocument>(true);
  }
  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    return this.model.findOneAndDelete(filterQuery).lean<TDocument>(true);
  }
}
